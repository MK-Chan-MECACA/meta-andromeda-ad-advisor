// Pure Stripe event → subscriptions row update. No I/O; the webhook route
// verifies the event, calls this, then persists. Null fields mean "keep".
import type Stripe from "stripe";
import type { Plan } from "./entitlements.ts";

export type SubscriptionUpdate = {
  workspaceId: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  plan: Plan | null;
  status: string | null;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
};

const id = (x: string | { id: string } | null | undefined) =>
  x == null ? null : typeof x === "string" ? x : x.id;
const date = (unix: number | undefined) => (unix ? new Date(unix * 1000) : null);

function update(
  workspaceId: string | undefined,
  fields: Partial<Omit<SubscriptionUpdate, "workspaceId">>,
): SubscriptionUpdate | null {
  if (!workspaceId) return null;
  return {
    workspaceId,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    plan: null,
    status: null,
    currentPeriodStart: null,
    currentPeriodEnd: null,
    ...fields,
  };
}

// ponytail: events applied in arrival order, no event.created guard — a late
// stale event can briefly regress status until the next subscription event.
export function reduceStripeEvent(event: Stripe.Event): SubscriptionUpdate | null {
  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object;
      if (s.mode !== "subscription") return null;
      return update(s.metadata?.workspace_id, {
        stripeCustomerId: id(s.customer),
        stripeSubscriptionId: id(s.subscription),
        plan: "pro",
      });
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const s = event.data.object;
      // Period lives on the item in current API versions; one item per sub here.
      const item = s.items.data[0];
      return update(s.metadata?.workspace_id, {
        stripeCustomerId: id(s.customer),
        stripeSubscriptionId: s.id,
        plan: "pro",
        status: s.status,
        currentPeriodStart: date(item?.current_period_start),
        currentPeriodEnd: date(item?.current_period_end),
      });
    }
    case "invoice.payment_failed": {
      const inv = event.data.object;
      const details = inv.parent?.subscription_details;
      return update(details?.metadata?.workspace_id, {
        stripeCustomerId: id(inv.customer),
        stripeSubscriptionId: id(details?.subscription),
        status: "past_due",
      });
    }
    default:
      return null;
  }
}
