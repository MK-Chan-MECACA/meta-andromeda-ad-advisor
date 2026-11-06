import Stripe from "stripe";
import { sql } from "@/lib/db";
import type { Plan } from "@/lib/entitlements";

let client: Stripe | undefined;

/** Lazy so `next build` works without STRIPE_SECRET_KEY. */
export function stripe(): Stripe {
  return (client ??= new Stripe(process.env.STRIPE_SECRET_KEY ?? ""));
}

type BillingRow = {
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: Plan;
  status: string;
};

/** The workspace's billing row fields the billing routes need. */
export async function billingRow(workspaceId: string) {
  const rows = await sql`
    select stripe_customer_id, stripe_subscription_id, plan, status
    from subscriptions where workspace_id = ${workspaceId}`;
  return rows[0] as BillingRow | undefined;
}

/** A Stripe subscription that still exists and can bill (incl. past_due). */
export function hasLiveSubscription(
  row: BillingRow | undefined,
): row is BillingRow & { stripe_subscription_id: string } {
  return (
    !!row?.stripe_subscription_id &&
    !["canceled", "incomplete_expired"].includes(row.status)
  );
}
