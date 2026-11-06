import { test } from "node:test";
import assert from "node:assert/strict";
import { entitlements, periodStart, modelFor } from "./entitlements.ts";

const now = new Date("2026-11-06T12:00:00Z");
const pro = (status = "active", start = "2026-10-20T03:00:00Z") => ({
  plan: "pro" as const,
  status,
  currentPeriodStart: new Date(start),
});

test("free period starts at calendar month in Malaysia time", () => {
  // 1 Nov 00:00 MYT = 31 Oct 16:00 UTC
  assert.equal(periodStart(null, now).toISOString(), "2026-10-31T16:00:00.000Z");
  // 31 Oct 17:00 UTC is already 1 Nov 01:00 in MYT
  assert.equal(
    periodStart(null, new Date("2026-10-31T17:00:00Z")).toISOString(),
    "2026-10-31T16:00:00.000Z",
  );
  // 31 Oct 15:00 UTC is still October in MYT
  assert.equal(
    periodStart(null, new Date("2026-10-31T15:00:00Z")).toISOString(),
    "2026-09-30T16:00:00.000Z",
  );
});

test("pro period starts at Stripe current_period_start", () => {
  assert.equal(periodStart(pro(), now).toISOString(), "2026-10-20T03:00:00.000Z");
});

test("free workspace allowed under quota, blocked at quota", () => {
  const ok = entitlements({ subscription: null, used: 9, members: 1 });
  assert.equal(ok.plan, "free");
  assert.equal(ok.quota, 10);
  assert.equal(ok.remaining, 1);
  assert.equal(ok.allowed, true);

  const full = entitlements({ subscription: null, used: 10, members: 1 });
  assert.equal(full.allowed, false);
  assert.equal(full.reason, "quota");
  assert.equal(full.remaining, 0);
});

test("active pro gets pro limits", () => {
  const e = entitlements({ subscription: pro(), used: 150, members: 4 });
  assert.equal(e.plan, "pro");
  assert.equal(e.quota, 200);
  assert.equal(e.seats, 5);
  assert.equal(e.allowed, true);
});

test("trialing counts as pro; past_due and canceled fall back to free", () => {
  assert.equal(entitlements({ subscription: pro("trialing"), used: 0, members: 1 }).plan, "pro");
  for (const status of ["past_due", "canceled", "unpaid", "incomplete"]) {
    assert.equal(entitlements({ subscription: pro(status), used: 0, members: 1 }).plan, "free");
  }
});

test("over seat limit blocks analyses (downgraded team)", () => {
  const e = entitlements({ subscription: null, used: 0, members: 3 });
  assert.equal(e.allowed, false);
  assert.equal(e.reason, "seats");
});

test("model per plan from config with defaults", () => {
  assert.equal(modelFor("pro", {}), "spacexai/grok-4.7");
  assert.equal(modelFor("pro", { MODEL_PRO: "x/y" }), "x/y");
  assert.equal(modelFor("free", { MODEL_FREE: "a/b" }), "a/b");
  assert.ok(modelFor("free", {}).length > 0);
});
