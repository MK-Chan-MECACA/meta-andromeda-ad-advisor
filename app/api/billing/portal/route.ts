import { NextResponse } from "next/server";
import { billingRow, stripe } from "@/lib/stripe";
import { handle, httpError, requireWorkspace } from "@/lib/workspace";

/** Admin-only: open the Stripe Customer Portal (payment method, invoices, cancel). */
export const POST = handle(async (req: Request) => {
  const ws = await requireWorkspace({ admin: true });
  const customer = (await billingRow(ws.workspaceId))?.stripe_customer_id;
  if (!customer) throw httpError(404, "This workspace has no billing account yet.");
  const session = await stripe().billingPortal.sessions.create({
    customer,
    return_url: new URL("/dashboard", req.url).toString(),
  });
  return NextResponse.json({ url: session.url });
});
