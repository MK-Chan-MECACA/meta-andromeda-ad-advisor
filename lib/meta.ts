import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { emptyIntakeForm, type IntakeFormState } from "@/lib/types";

export const SESSION_COOKIE = "meta_session";

const GRAPH_VERSION = process.env.GRAPH_API_VERSION ?? "v25.0";
const GRAPH = `https://graph.facebook.com/${GRAPH_VERSION}`;

export function metaEnv() {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const configId = process.env.META_CONFIG_ID;
  const secret = process.env.SESSION_SECRET;
  if (!appId || !appSecret || !secret) {
    throw new Error(
      "Missing META_APP_ID / META_APP_SECRET / SESSION_SECRET. See README.",
    );
  }
  return { appId, appSecret, configId, secret };
}

export function redirectUri(req: Request) {
  return (
    process.env.META_REDIRECT_URI ??
    new URL("/api/meta/callback", req.url).toString()
  );
}

/* ---------- signed cookie session ---------- */

function sign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

export function sealSession(token: string, expiresInSec: number) {
  const { secret } = metaEnv();
  const payload = Buffer.from(
    JSON.stringify({ t: token, e: Date.now() + expiresInSec * 1000 }),
  ).toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}

export function openSession(cookie: string | undefined): string | null {
  if (!cookie) return null;
  const [payload, sig] = cookie.split(".");
  if (!payload || !sig) return null;

  const expected = sign(payload, metaEnv().secret);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const { t, e } = JSON.parse(Buffer.from(payload, "base64url").toString());
    return typeof t === "string" && typeof e === "number" && e > Date.now()
      ? t
      : null;
  } catch {
    return null;
  }
}

/** Self-contained CSRF state — no cookie required (survives Facebook redirects). */
export function createOAuthState(ttlMs = 10 * 60 * 1000) {
  const { secret } = metaEnv();
  const payload = Buffer.from(
    JSON.stringify({ n: randomBytes(16).toString("hex"), e: Date.now() + ttlMs }),
  ).toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}

export function verifyOAuthState(state: string | null): boolean {
  if (!state) return false;
  const [payload, sig] = state.split(".");
  if (!payload || !sig) return false;

  const expected = sign(payload, metaEnv().secret);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  try {
    const { e } = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
      e?: number;
    };
    return typeof e === "number" && e > Date.now();
  } catch {
    return false;
  }
}

/* ---------- graph ---------- */

export async function graph<T = Record<string, unknown>>(
  path: string,
  token: string,
  params: Record<string, string> = {},
): Promise<T> {
  const { appSecret } = metaEnv();
  const url = new URL(`${GRAPH}/${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set("access_token", token);
  url.searchParams.set(
    "appsecret_proof",
    createHmac("sha256", appSecret).update(token).digest("hex"),
  );

  const res = await fetch(url, { cache: "no-store" });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(
      (json as { error?: { message?: string } })?.error?.message ??
        `Graph error ${res.status}`,
    );
  }
  return json as T;
}

export function loginUrl(req: Request, state: string) {
  const { appId, configId } = metaEnv();
  const url = new URL(`https://www.facebook.com/${GRAPH_VERSION}/dialog/oauth`);
  url.searchParams.set("client_id", appId);
  url.searchParams.set("redirect_uri", redirectUri(req));
  url.searchParams.set("state", state);
  url.searchParams.set("response_type", "code");
  // Login for Business: config_id replaces scope. Fall back to scope if unset.
  if (configId) url.searchParams.set("config_id", configId);
  else url.searchParams.set("scope", "ads_read,business_management");
  return url.toString();
}

export async function exchangeCode(req: Request, code: string) {
  const { appId, appSecret } = metaEnv();
  const url = new URL(`${GRAPH}/oauth/access_token`);
  url.searchParams.set("client_id", appId);
  url.searchParams.set("client_secret", appSecret);
  url.searchParams.set("redirect_uri", redirectUri(req));
  url.searchParams.set("code", code);

  const res = await fetch(url, { cache: "no-store" });
  const json = (await res.json()) as {
    access_token?: string;
    expires_in?: number;
    error?: { message?: string };
  };
  if (!res.ok || !json.access_token) {
    throw new Error(json.error?.message ?? "Code exchange failed");
  }

  // Upgrade to a long-lived (60 day) token when possible.
  const longUrl = new URL(`${GRAPH}/oauth/access_token`);
  longUrl.searchParams.set("grant_type", "fb_exchange_token");
  longUrl.searchParams.set("client_id", appId);
  longUrl.searchParams.set("client_secret", appSecret);
  longUrl.searchParams.set("fb_exchange_token", json.access_token);
  const longRes = await fetch(longUrl, { cache: "no-store" });
  const longJson = (await longRes.json()) as {
    access_token?: string;
    expires_in?: number;
  };

  return longRes.ok && longJson.access_token
    ? {
        token: longJson.access_token,
        expiresIn: longJson.expires_in ?? 60 * 24 * 3600,
      }
    : { token: json.access_token, expiresIn: json.expires_in ?? 3600 };
}

/* ---------- ad -> intake mapping ---------- */

export type Json = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

export const AD_LIST_FIELDS =
  "id,name,effective_status,updated_time,creative{thumbnail_url},adset{name},campaign{name,objective}";

export const AD_DETAIL_FIELDS =
  "id,name,effective_status," +
  "creative{id,body,title,image_url,thumbnail_url,object_story_spec,asset_feed_spec,call_to_action_type}," +
  "adset{id,name,optimization_goal,destination_type,daily_budget,lifetime_budget,targeting,learning_stage_info,is_dynamic_creative,promoted_object}," +
  "campaign{id,name,objective,buying_type,daily_budget,lifetime_budget}";

export const INSIGHT_FIELDS =
  "spend,ctr,cpc,frequency,impressions,reach,cost_per_action_type,cost_per_result,quality_ranking,engagement_rate_ranking,conversion_rate_ranking";

const money = (minor?: string | number, currency = "") =>
  minor == null ? "" : `${currency} ${(Number(minor) / 100).toFixed(2)}`.trim();

function creativeCopy(creative: Json = {}) {
  const link = creative.object_story_spec?.link_data ?? {};
  const video = creative.object_story_spec?.video_data ?? {};
  const feed = creative.asset_feed_spec ?? {};

  return {
    primaryText:
      creative.body ?? link.message ?? video.message ?? feed.bodies?.[0]?.text ?? "",
    headline:
      creative.title ?? link.name ?? video.title ?? feed.titles?.[0]?.text ?? "",
    description:
      link.description ?? video.link_description ?? feed.descriptions?.[0]?.text ?? "",
    cta:
      link.call_to_action?.type ??
      video.call_to_action?.type ??
      creative.call_to_action_type ??
      feed.call_to_action_types?.[0] ??
      "",
  };
}

function targetingSummary(t: Json = {}) {
  const interests = (t.flexible_spec ?? [])
    .flatMap((s: Json) => [
      ...(s.interests ?? []),
      ...(s.behaviors ?? []),
      ...(s.life_events ?? []),
    ])
    .map((i: Json) => i.name)
    .filter(Boolean);
  const custom = (t.custom_audiences ?? []).map(
    (a: Json) => a.name ?? a.id,
  );
  const excluded = (t.excluded_custom_audiences ?? []).map(
    (a: Json) => a.name ?? a.id,
  );

  const advantage = t.targeting_automation?.advantage_audience === 1;
  const mode = advantage
    ? "advantage_plus"
    : interests.length
      ? "interest"
      : custom.length
        ? "lal"
        : "broad";

  const geoParts = [
    ...(t.geo_locations?.countries ?? []),
    ...(t.geo_locations?.cities ?? []).map((c: Json) => c.name),
    ...(t.geo_locations?.regions ?? []).map((r: Json) => r.name),
  ];
  const age = [t.age_min, t.age_max].filter(Boolean).join("–");

  return {
    mode,
    geo: [geoParts.join(", "), age].filter(Boolean).join(" · "),
    details: [
      interests.length ? `Interests: ${interests.join(", ")}` : "",
      custom.length ? `Custom audiences: ${custom.join(", ")}` : "",
      excluded.length ? `Excluded: ${excluded.join(", ")}` : "",
      advantage ? "Advantage+ audience on" : "",
    ]
      .filter(Boolean)
      .join(" | "),
    placements:
      (t.publisher_platforms ?? []).join(", ") ||
      "Advantage+ placements (automatic)",
  };
}

/** Prefer purchase/lead CPA from cost_per_action_type; fall back to cost_per_result. */
function formatCpa(insights: Json | null, currency: string): string {
  if (!insights) return "";

  const preferred = [
    "purchase",
    "omni_purchase",
    "lead",
    "onsite_conversion.lead_grouped",
    "complete_registration",
  ];

  const actions: Json[] = insights.cost_per_action_type ?? [];
  for (const key of preferred) {
    const hit = actions.find((a) => a?.action_type === key && a?.value != null);
    if (hit) return `${currency} ${Number(hit.value).toFixed(2)}`.trim();
  }
  if (actions[0]?.value != null) {
    return `${currency} ${Number(actions[0].value).toFixed(2)}`.trim();
  }

  const result = insights.cost_per_result?.[0];
  const resultValue = result?.values?.[0]?.value ?? result?.value;
  return resultValue != null
    ? `${currency} ${Number(resultValue).toFixed(2)}`.trim()
    : "";
}

export function mapAdToIntake(
  ad: Json,
  insights: Json | null,
  adsInAdSet: number | null,
  currency: string,
): Omit<IntakeFormState, "images"> {
  const adset = ad.adset ?? {};
  const campaign = ad.campaign ?? {};
  const t = targetingSummary(adset.targeting);
  const campaignBudget = campaign.daily_budget ?? campaign.lifetime_budget;
  const base = emptyIntakeForm();

  const budget = campaignBudget
    ? `${money(campaignBudget, currency)}${campaign.daily_budget ? "/day" : " lifetime"} (CBO)`
    : adset.daily_budget || adset.lifetime_budget
      ? `${money(adset.daily_budget ?? adset.lifetime_budget, currency)}${adset.daily_budget ? "/day" : " lifetime"} (ABO)`
      : "";

  const rankings = [
    insights?.quality_ranking && `Quality: ${insights.quality_ranking}`,
    insights?.engagement_rate_ranking &&
      `Engagement: ${insights.engagement_rate_ranking}`,
    insights?.conversion_rate_ranking &&
      `Conversion: ${insights.conversion_rate_ranking}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return {
    copy: { ...base.copy, ...creativeCopy(ad.creative) },
    setup: {
      objective: campaign.objective ?? "",
      conversionLocation:
        adset.destination_type ??
        adset.promoted_object?.custom_event_type ??
        adset.optimization_goal ??
        "",
      targeting: t.details,
      targetingMode: t.mode,
      geo: t.geo,
      budget,
      placements: t.placements,
      adsInAdSet: adsInAdSet == null ? "" : String(adsInAdSet),
      campaignType: [
        campaign.buying_type ?? "AUCTION",
        campaignBudget ? "CBO" : "ABO",
        adset.is_dynamic_creative ? "Dynamic creative" : "",
        adset.optimization_goal ? `Goal: ${adset.optimization_goal}` : "",
      ]
        .filter(Boolean)
        .join(" · "),
    },
    metrics: {
      spend: insights?.spend ? `${currency} ${insights.spend}` : "",
      ctr: insights?.ctr ? `${Number(insights.ctr).toFixed(2)}%` : "",
      cpc: insights?.cpc ? `${currency} ${Number(insights.cpc).toFixed(2)}` : "",
      cpa: formatCpa(insights, currency),
      frequency: insights?.frequency
        ? Number(insights.frequency).toFixed(2)
        : "",
      learningStatus: adset.learning_stage_info?.status ?? "",
      qualityRanking: rankings,
      notes: [
        `Imported from Meta: ${ad.name ?? ad.id}`,
        insights?.impressions ? `${insights.impressions} impressions` : "",
        insights?.reach ? `${insights.reach} reach` : "",
        insights ? "Last 7 days" : "No insights in last 7 days",
      ]
        .filter(Boolean)
        .join(" · "),
    },
  };
}
