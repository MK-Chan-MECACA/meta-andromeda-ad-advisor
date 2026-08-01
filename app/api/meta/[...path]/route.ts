import { NextResponse, type NextRequest } from "next/server";
import {
  AD_DETAIL_FIELDS,
  AD_LIST_FIELDS,
  INSIGHT_FIELDS,
  type Json,
  SESSION_COOKIE,
  STATE_COOKIE,
  exchangeCode,
  graph,
  loginUrl,
  mapAdToIntake,
  newState,
  openSession,
  sealSession,
} from "@/lib/meta";

export const dynamic = "force-dynamic";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const cookieOpts = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

async function toDataUrl(url?: string): Promise<string | null> {
  if (!url) return null;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength > MAX_IMAGE_BYTES) return null;
    const type = res.headers.get("content-type") ?? "image/jpeg";
    return `data:${type};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  const [action, arg] = path;
  const token = openSession(req.cookies.get(SESSION_COOKIE)?.value);

  try {
    switch (action) {
      case "login": {
        const state = newState();
        const res = NextResponse.redirect(loginUrl(req, state));
        res.cookies.set(STATE_COOKIE, state, { ...cookieOpts, maxAge: 600 });
        return res;
      }

      case "callback": {
        const url = new URL(req.url);
        const error = url.searchParams.get("error_description");
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const expected = req.cookies.get(STATE_COOKIE)?.value;

        if (error) return fail(req, error);
        if (!code || !state || state !== expected) {
          return fail(req, "OAuth state mismatch. Try connecting again.");
        }

        const { token: fresh, expiresIn } = await exchangeCode(req, code);
        const res = NextResponse.redirect(new URL("/?meta=connected", req.url));
        res.cookies.set(SESSION_COOKIE, sealSession(fresh, expiresIn), {
          ...cookieOpts,
          maxAge: expiresIn,
        });
        res.cookies.delete(STATE_COOKIE);
        return res;
      }

      case "logout": {
        const res = NextResponse.redirect(new URL("/", req.url));
        res.cookies.delete(SESSION_COOKIE);
        return res;
      }

      case "status":
        return NextResponse.json({ connected: Boolean(token) });
    }

    if (!token) {
      return NextResponse.json({ error: "Not connected." }, { status: 401 });
    }

    const q = new URL(req.url).searchParams;

    switch (action) {
      case "accounts": {
        const data = await graph<{ data: unknown[] }>("me/adaccounts", token, {
          fields: "id,account_id,name,currency,account_status",
          limit: "100",
        });
        return NextResponse.json({ accounts: data.data ?? [] });
      }

      case "ads": {
        const accountId = q.get("account_id");
        if (!accountId) {
          return NextResponse.json(
            { error: "account_id required." },
            { status: 400 },
          );
        }
        const data = await graph<{ data: unknown[] }>(
          `${accountId}/ads`,
          token,
          { fields: AD_LIST_FIELDS, limit: "50" },
        );
        return NextResponse.json({ ads: data.data ?? [] });
      }

      case "ad": {
        if (!arg) {
          return NextResponse.json({ error: "ad id required." }, { status: 400 });
        }
        const currency = q.get("currency") ?? "";
        const ad = await graph<Json>(arg, token, { fields: AD_DETAIL_FIELDS });

        // Insights and sibling-ad count are best-effort — a new ad has neither.
        const [insights, siblings] = await Promise.all([
          graph<{ data: Record<string, unknown>[] }>(`${arg}/insights`, token, {
            fields: INSIGHT_FIELDS,
            date_preset: "last_7d",
          })
            .then((r) => r.data?.[0] ?? null)
            .catch(() => null),
          ad.adset?.id
            ? graph<{ data: unknown[] }>(`${ad.adset.id}/ads`, token, {
                fields: "id",
                limit: "100",
              })
                .then((r) => r.data?.length ?? null)
                .catch(() => null)
            : Promise.resolve(null),
        ]);

        const intake = mapAdToIntake(ad, insights, siblings, currency);
        const image = await toDataUrl(
          ad.creative?.image_url ?? ad.creative?.thumbnail_url,
        );

        return NextResponse.json({
          ...intake,
          image,
          name: ad.name ?? arg,
        });
      }
    }

    return NextResponse.json({ error: "Unknown route." }, { status: 404 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Meta request failed.";
    console.error("[meta]", action, err);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

function fail(req: NextRequest, message: string) {
  return NextResponse.redirect(
    new URL(`/?meta_error=${encodeURIComponent(message)}`, req.url),
  );
}
