import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import {
  entitlements,
  periodStart,
  type Entitlements,
  type SubscriptionState,
} from "@/lib/entitlements";

export type Workspace = {
  userId: string;
  /** Clerk organization id — the tenant key on every row. */
  workspaceId: string;
  isAdmin: boolean;
};

/** Thrown by requireWorkspace; route handlers return `err.response`. */
export class HttpError extends Error {
  constructor(public response: NextResponse) {
    super("http error");
  }
}

export function httpError(status: number, error: string): HttpError {
  return new HttpError(NextResponse.json({ error }, { status }));
}

/** Signed-in user + active workspace, or a 401/403 HttpError. */
export async function requireWorkspace(
  opts: { admin?: boolean } = {},
): Promise<Workspace> {
  const { userId, orgId, orgRole } = await auth();
  if (!userId) throw httpError(401, "Sign in required.");
  if (!orgId) throw httpError(403, "Select a workspace first.");
  const isAdmin = orgRole === "org:admin";
  if (opts.admin && !isAdmin) {
    throw httpError(403, "Only workspace admins can do this.");
  }
  return { userId, workspaceId: orgId, isAdmin };
}

/** Wraps a handler so thrown HttpErrors become their responses. */
export function handle<A extends unknown[]>(
  fn: (...args: A) => Promise<Response>,
): (...args: A) => Promise<Response> {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (err) {
      if (err instanceof HttpError) return err.response;
      throw err;
    }
  };
}

export async function loadSubscription(
  workspaceId: string,
): Promise<SubscriptionState> {
  const rows = await sql`
    select plan, status, current_period_start
    from subscriptions where workspace_id = ${workspaceId}`;
  const row = rows[0];
  if (!row) return null;
  return {
    plan: row.plan === "pro" ? "pro" : "free",
    status: String(row.status),
    currentPeriodStart: row.current_period_start
      ? new Date(row.current_period_start as string)
      : null,
  };
}

/** Current plan, limits and usage for the workspace. */
export async function workspaceEntitlements(
  workspaceId: string,
): Promise<Entitlements & { periodStart: string }> {
  const subscription = await loadSubscription(workspaceId);
  const start = periodStart(subscription);
  const [countRows, members] = await Promise.all([
    sql`select count(*)::int as n from analyses
        where workspace_id = ${workspaceId} and created_at >= ${start.toISOString()}`,
    clerkClient().then((c) =>
      c.organizations.getOrganizationMembershipList({
        organizationId: workspaceId,
        limit: 1,
      }),
    ),
  ]);
  return {
    ...entitlements({
      subscription,
      used: Number(countRows[0]?.n ?? 0),
      members: members.totalCount,
    }),
    periodStart: start.toISOString(),
  };
}
