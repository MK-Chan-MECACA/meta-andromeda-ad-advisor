import { test } from "node:test";
import assert from "node:assert/strict";
import type Stripe from "stripe";
import { reduceStripeEvent } from "./billing.ts";

const ev = (type: string, object: unknown) =>
  ({ type, data: { object } }) as unknown as Stripe.Event;

const sub = (status: string, start: number, end: number) => ({
  id: "sub_1",
  customer: "cus_1",
  status,
  metadata: { workspace_id: "org_1" },
  items: { data: [{ current_period_start: start, current_period_end: end }] },
});

test("checkout completed links customer + subscription to the workspace", () => {
  const u = reduceStripeEvent(
    ev("checkout.session.completed", {
      mode: "subscription",
      customer: "cus_1",
      subscription: "sub_1",
      metadata: { workspace_id: "org_1" },
    }),
  );
  assert.deepEqual(u, {
    workspaceId: "org_1",
    stripeCustomerId: "cus_1",
    stripeSubscriptionId: "sub_1",
    plan: "pro",
    status: null,
    currentPeriodStart: null,
    currentPeriodEnd: null,
  });
});

test("one-off (non-subscription) checkout is ignored", () => {
  assert.equal(
    reduceStripeEvent(
      ev("checkout.session.completed", {
        mode: "payment",
        metadata: { workspace_id: "org_1" },
      }),
    ),
    null,
  );
});

test("subscription created sets pro, status and item period", () => {
  const u = reduceStripeEvent(
    ev("customer.subscription.created", sub("active", 1_790_000_000, 1_792_592_000)),
  );
  assert.deepEqual(u, {
    workspaceId: "org_1",
    stripeCustomerId: "cus_1",
    stripeSubscriptionId: "sub_1",
    plan: "pro",
    status: "active",
    currentPeriodStart: new Date(1_790_000_000_000),
    currentPeriodEnd: new Date(1_792_592_000_000),
  });
});

test("renewal (subscription updated) moves the period forward", () => {
  const u = reduceStripeEvent(
    ev("customer.subscription.updated", sub("active", 1_792_592_000, 1_795_184_000)),
  );
  assert.equal(u?.currentPeriodStart?.getTime(), 1_792_592_000_000);
  assert.equal(u?.currentPeriodEnd?.getTime(), 1_795_184_000_000);
  assert.equal(u?.status, "active");
});

test("subscription deleted records canceled status", () => {
  const u = reduceStripeEvent(
    ev("customer.subscription.deleted", sub("canceled", 1, 2)),
  );
  assert.equal(u?.status, "canceled");
  assert.equal(u?.workspaceId, "org_1");
});

test("expanded customer object is reduced to its id", () => {
  const u = reduceStripeEvent(
    ev("customer.subscription.updated", { ...sub("past_due", 1, 2), customer: { id: "cus_9" } }),
  );
  assert.equal(u?.stripeCustomerId, "cus_9");
  assert.equal(u?.status, "past_due");
});

test("invoice payment failed marks the workspace past_due", () => {
  const u = reduceStripeEvent(
    ev("invoice.payment_failed", {
      customer: "cus_1",
      parent: {
        type: "subscription_details",
        subscription_details: {
          subscription: "sub_1",
          metadata: { workspace_id: "org_1" },
        },
      },
    }),
  );
  assert.deepEqual(u, {
    workspaceId: "org_1",
    stripeCustomerId: "cus_1",
    stripeSubscriptionId: "sub_1",
    plan: null,
    status: "past_due",
    currentPeriodStart: null,
    currentPeriodEnd: null,
  });
});

test("events without a workspace_id are ignored", () => {
  assert.equal(
    reduceStripeEvent(
      ev("customer.subscription.updated", { ...sub("active", 1, 2), metadata: {} }),
    ),
    null,
  );
});

test("unknown event types are ignored", () => {
  assert.equal(reduceStripeEvent(ev("charge.succeeded", { id: "ch_1" })), null);
});
