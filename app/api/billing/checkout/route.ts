import { NextResponse } from "next/server";
import { billingRow, hasLiveSubscription, stripe } from "@/lib/stripe";
import { handle, httpError, requireWorkspace } from "@/lib/workspace";

/** Admin-only: start a Stripe Checkout subscription for Pro (MYR prices). */
export const POST = handle(async (req: Request) => {
  const ws = await requireWorkspace({ admin: true });
  const { interval } = (await req.json().catch(() => ({}))) as {
    interval?: string;
  };
  if (interval !== "month" && interval !== "year") {
    throw httpError(400, "Choose monthly or yearly billing.");
  }
  const price =
    interval === "year"
      ? process.env.STRIPE_PRICE_PRO_YEARLY
      : process.env.STRIPE_PRICE_PRO_MONTHLY;
  if (!price) throw httpError(500, "Billing is not configured.");

  const row = await billingRow(ws.workspaceId);
  // Past-due/unpaid subs are fixed in the portal, not by a second subscription.
  if (hasLiveSubscription(row)) {
    throw httpError(409, "This workspace already has a subscription — use Manage billing.");
  }

  const metadata = { workspace_id: ws.workspaceId };
  const session = await stripe().checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price, quantity: 1 }],
    customer: row?.stripe_customer_id ?? undefined,
    client_reference_id: ws.workspaceId,
    metadata,
    subscription_data: { metadata },
    // ponytail: card only. Stripe FPX and GrabPay are single-payment methods
    // that can't be saved for recurring subscription charges. To accept them,
    // add a one-time "payment" mode checkout for the yearly plan that grants a
    // 12-month period, or invoice with collection_method=send_invoice.
    allowed_payment_method_types: ["card"],
    success_url: new URL("/dashboard?billing=success", req.url).toString(),
    cancel_url: new URL("/dashboard?billing=cancelled", req.url).toString(),
  });
  return NextResponse.json({ url: session.url });
});
