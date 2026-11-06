import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import type Stripe from "stripe";
import { reduceStripeEvent } from "@/lib/billing";
import { sql } from "@/lib/db";
import { PLANS, effectivePlan, type Plan } from "@/lib/entitlements";
import { stripe } from "@/lib/stripe";

/** Stripe → subscriptions row → Clerk seat limit. */
export async function POST(req: Request) {
  let event: Stripe.Event;
  try {
    event = await stripe().webhooks.constructEventAsync(
      await req.text(),
      req.headers.get("stripe-signature") ?? "",
      process.env.STRIPE_WEBHOOK_SECRET ?? "",
    );
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  const update = reduceStripeEvent(event);
  if (!update) return NextResponse.json({ received: true });

  // Null fields keep the stored value (e.g. checkout carries no status).
  const rows = await sql`
    insert into subscriptions (workspace_id, stripe_customer_id, stripe_subscription_id,
      plan, status, current_period_start, current_period_end)
    values (${update.workspaceId}, ${update.stripeCustomerId}, ${update.stripeSubscriptionId},
      coalesce(${update.plan}, 'free'), coalesce(${update.status}, 'none'),
      ${update.currentPeriodStart?.toISOString() ?? null}, ${update.currentPeriodEnd?.toISOString() ?? null})
    on conflict (workspace_id) do update set
      stripe_customer_id = coalesce(excluded.stripe_customer_id, subscriptions.stripe_customer_id),
      stripe_subscription_id = coalesce(excluded.stripe_subscription_id, subscriptions.stripe_subscription_id),
      plan = coalesce(${update.plan}, subscriptions.plan),
      status = coalesce(${update.status}, subscriptions.status),
      current_period_start = coalesce(excluded.current_period_start, subscriptions.current_period_start),
      current_period_end = coalesce(excluded.current_period_end, subscriptions.current_period_end),
      updated_at = now()
    where subscriptions.workspace_id = ${update.workspaceId}
      -- Ignore events from an older subscription while a different one is live.
      and (excluded.stripe_subscription_id is null
        or subscriptions.stripe_subscription_id is null
        or subscriptions.stripe_subscription_id = excluded.stripe_subscription_id
        or subscriptions.status in ('canceled', 'incomplete_expired', 'none'))
    returning plan, status`;
  const row = rows[0] as { plan: Plan; status: string } | undefined;
  if (!row) return NextResponse.json({ received: true, ignored: "stale subscription" });
  const plan = effectivePlan({ ...row, currentPeriodStart: null });

  try {
    const clerk = await clerkClient();
    await clerk.organizations.updateOrganization(update.workspaceId, {
      maxAllowedMemberships: PLANS[plan].seats,
    });
  } catch (err) {
    if (!isClerkAPIResponseError(err) || err.status !== 404) throw err;
    // Workspace already deleted (e.g. the cancellation we triggered from the
    // Clerk organization.deleted webhook): drop the row this event re-created.
    await sql`delete from subscriptions where workspace_id = ${update.workspaceId}`;
  }
  return NextResponse.json({ received: true });
}
