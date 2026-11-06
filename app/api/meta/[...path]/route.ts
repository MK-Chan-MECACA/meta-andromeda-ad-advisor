import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";
import {
  AD_DETAIL_FIELDS,
  AD_LIST_FIELDS,
  INSIGHT_FIELDS,
  type Json,
  createOAuthState,
  deleteConnection,
  exchangeCode,
  graph,
  loadConnection,
  loginUrl,
  mapAdToIntake,
  saveConnection,
  verifyOAuthState,
  workspaceToken,
} from "@/lib/meta";
import { HttpError, handle, requireWorkspace } from "@/lib/workspace";

export const dynamic = "force-dynamic";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

type Ctx = { params: Promise<{ path: string[] }> };

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

/** Browser navigations (login/callback) land back on the dashboard with a message. */
function fail(req: NextRequest, message: string) {
  return NextResponse.redirect(
    new URL(`/dashboard?meta_error=${encodeURIComponent(message)}`, req.url),
  );
}

async function oauth(req: NextRequest, action: "login" | "callback") {
  try {
    const ws = await requireWorkspace({ admin: true });
    if (action === "login") {
      return NextResponse.redirect(loginUrl(req, createOAuthState(ws)));
    }

    const url = new URL(req.url);
    const error = url.searchParams.get("error_description");
    const code = url.searchParams.get("code");
    if (error) return fail(req, error);
    if (!code || !verifyOAuthState(url.searchParams.get("state"), ws)) {
      return fail(req, "OAuth session expired or invalid. Click Connect Meta again.");
    }

    const { token, expiresIn } = await exchangeCode(req, code);
    const me = await graph<{ id: string }>("me", token, { fields: "id" });
    await saveConnection(ws, token, expiresIn, me.id);
    return NextResponse.redirect(new URL("/dashboard?meta=connected", req.url));
  } catch (err) {
    console.error("[meta]", action, err);
    if (err instanceof HttpError) {
      const { error } = (await err.response.json()) as { error: string };
      return fail(req, error);
    }
    return fail(req, err instanceof Error ? err.message : "Meta login failed.");
  }
}

async function status() {
  const ws = await requireWorkspace();
  const row = await loadConnection(ws.workspaceId);
  let connectedBy: string | null = null;
  if (row) {
    connectedBy = await clerkClient()
      .then((c) => c.users.getUser(row.connected_by))
      .then((u) => u.fullName ?? u.primaryEmailAddress?.emailAddress ?? null)
      .catch(() => null); // user deleted — still connected, just unnamed
  }
  return NextResponse.json({
    connected: Boolean(row),
    connectedBy,
    expiresAt: row?.expires_at ?? null,
    isAdmin: ws.isAdmin,
  });
}

async function graphRoute(req: NextRequest, action: string, arg?: string) {
  const ws = await requireWorkspace();
  const token = await workspaceToken(ws.workspaceId);
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
        return NextResponse.json({ error: "account_id required." }, { status: 400 });
      }
      const data = await graph<{ data: unknown[] }>(`${accountId}/ads`, token, {
        fields: AD_LIST_FIELDS,
        limit: "50",
      });
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

      return NextResponse.json({ ...intake, image, name: ad.name ?? arg, id: ad.id ?? arg });
    }
  }

  return NextResponse.json({ error: "Unknown route." }, { status: 404 });
}

export const GET = handle(async (req: NextRequest, ctx: Ctx) => {
  const [action, arg] = (await ctx.params).path;
  if (action === "login" || action === "callback") return oauth(req, action);
  if (action === "status") return status();
  try {
    return await graphRoute(req, action, arg);
  } catch (err) {
    if (err instanceof HttpError) throw err;
    console.error("[meta]", action, err);
    const message = err instanceof Error ? err.message : "Meta request failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
});

/** POST, not a link: a cross-site GET must not be able to disconnect a workspace. */
export const POST = handle(async (_req: NextRequest, ctx: Ctx) => {
  const [action] = (await ctx.params).path;
  if (action !== "disconnect") {
    return NextResponse.json({ error: "Unknown route." }, { status: 404 });
  }
  const ws = await requireWorkspace({ admin: true });
  // ponytail: deletes our copy only; the grant stays in the admin's Facebook settings. Call DELETE /me/permissions if full revocation is wanted.
  await deleteConnection(ws.workspaceId);
  return NextResponse.json({ connected: false });
});
