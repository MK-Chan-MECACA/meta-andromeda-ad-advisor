// Pure plan/quota/seat/model rules. No I/O — callers load the subscription row
// and usage count, then ask this module what the workspace may do.

export type Plan = "free" | "pro";

/** Single source of truth for plan limits (placeholders, tune after cost data). */
export const PLANS: Record<Plan, { seats: number; quota: number }> = {
  free: { seats: 1, quota: 10 },
  pro: { seats: 5, quota: 200 },
};

export type SubscriptionState = {
  plan: Plan;
  status: string;
  currentPeriodStart: Date | null;
} | null;

const ACTIVE = new Set(["active", "trialing"]);
const MYT_OFFSET_MS = 8 * 60 * 60 * 1000; // Asia/Kuala_Lumpur, no DST

export function effectivePlan(sub: SubscriptionState): Plan {
  return sub?.plan === "pro" && ACTIVE.has(sub.status) ? "pro" : "free";
}

/** `start` + n calendar months (UTC), day clamped to the target month's length. */
function addMonths(start: Date, n: number): Date {
  const y = start.getUTCFullYear();
  const m = start.getUTCMonth() + n;
  const lastDay = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const d = new Date(start);
  d.setUTCFullYear(y, m, Math.min(start.getUTCDate(), lastDay));
  return d;
}

/**
 * Start of the current quota period. Pro: monthly anniversary of the Stripe
 * period start (so yearly plans still get a monthly quota). Free: MYT calendar month.
 */
export function periodStart(sub: SubscriptionState, now: Date = new Date()): Date {
  if (effectivePlan(sub) === "pro" && sub?.currentPeriodStart) {
    let n = 0;
    while (addMonths(sub.currentPeriodStart, n + 1) <= now) n++;
    return addMonths(sub.currentPeriodStart, n);
  }
  const local = new Date(now.getTime() + MYT_OFFSET_MS);
  return new Date(
    Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), 1) - MYT_OFFSET_MS,
  );
}

export type Entitlements = {
  plan: Plan;
  quota: number;
  seats: number;
  used: number;
  remaining: number;
  allowed: boolean;
  reason: "quota" | "seats" | null;
};

export function entitlements(input: {
  subscription: SubscriptionState;
  used: number;
  members: number;
}): Entitlements {
  const plan = effectivePlan(input.subscription);
  const { seats, quota } = PLANS[plan];
  const remaining = Math.max(0, quota - input.used);
  const reason =
    input.members > seats ? "seats" : remaining === 0 ? "quota" : null;
  return {
    plan,
    quota,
    seats,
    used: input.used,
    remaining,
    allowed: reason === null,
    reason,
  };
}

/** AI Gateway model slug per plan; env overrides after the model eval. */
export function modelFor(
  plan: Plan,
  env: Record<string, string | undefined> = process.env,
): string {
  return plan === "pro"
    ? env.MODEL_PRO || "spacexai/grok-4.7"
    : env.MODEL_FREE || "anthropic/claude-haiku-5.5";
}

/** Gateway fallback: Pro degrades to the Free model; Free to another cheap provider, never to Pro. */
export function fallbackFor(
  plan: Plan,
  env: Record<string, string | undefined> = process.env,
): string {
  return plan === "pro"
    ? modelFor("free", env)
    : env.MODEL_FALLBACK || "google/gemini-3.5-flash-lite";
}
