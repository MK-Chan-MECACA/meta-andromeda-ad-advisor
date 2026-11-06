import { NextResponse, type NextRequest } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { del, list } from "@vercel/blob";
import { sql } from "@/lib/db";
import { PLANS } from "@/lib/entitlements";
import { billingRow, hasLiveSubscription, stripe } from "@/lib/stripe";

/** Clerk lifecycle: seat limit on new workspaces, hard delete on removal. */
export async function POST(req: NextRequest) {
  let evt;
  try {
    evt = await verifyWebhook(req); // CLERK_WEBHOOK_SIGNING_SECRET
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  switch (evt.type) {
    case "organization.created": {
      const clerk = await clerkClient();
      await clerk.organizations.updateOrganization(evt.data.id, {
        maxAllowedMemberships: PLANS.free.seats,
      });
      break;
    }
    case "organization.deleted": {
      const workspaceId = evt.data.id;
      if (!workspaceId) break;
      // Cancel first: if this fails, the row survives and Clerk's retry tries again.
      const row = await billingRow(workspaceId);
      if (hasLiveSubscription(row)) {
        await stripe().subscriptions.cancel(row.stripe_subscription_id);
      }
      await sql`delete from analyses where workspace_id = ${workspaceId}`;
      await sql`delete from meta_connections where workspace_id = ${workspaceId}`;
      await sql`delete from subscriptions where workspace_id = ${workspaceId}`;
      // ponytail: skipped when Blob isn't connected yet (thumbnails ship in phase 5).
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        let cursor: string | undefined;
        do {
          const page = await list({ prefix: `workspaces/${workspaceId}/`, cursor });
          if (page.blobs.length) await del(page.blobs.map((b) => b.url));
          cursor = page.hasMore ? page.cursor : undefined;
        } while (cursor);
      }
      break;
    }
    case "user.deleted": {
      // Cross-workspace by design: a user's authorship is nulled everywhere;
      // the analyses stay with their workspaces.
      if (evt.data.id) {
        await sql`update analyses set created_by = null where created_by = ${evt.data.id}`;
      }
      break;
    }
  }
  return NextResponse.json({ received: true });
}
