import { auth, clerkClient } from "@clerk/nextjs/server";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { PLANS } from "@/lib/entitlements";
import { billingRow, hasLiveSubscription } from "@/lib/stripe";
import { workspaceEntitlements } from "@/lib/workspace";
import { UsageMeter } from "@/components/UsageMeter";
import { Logo } from "@/components/Logo";
import { Separator } from "@/components/ui/separator";
import { ActivateWorkspace } from "./ActivateWorkspace";
import { NavLinks } from "./NavLinks";

/** Ensures the user has an active workspace, creating a personal one on first visit. */
async function activeWorkspace(userId: string, orgId: string | null | undefined) {
  if (orgId) return { orgId, pending: null };
  const clerk = await clerkClient();
  const memberships = await clerk.users.getOrganizationMembershipList({
    userId,
    limit: 1,
  });
  const existing = memberships.data[0]?.organization.id;
  if (existing) return { orgId: null, pending: existing };
  const org = await clerk.organizations.createOrganization({
    name: "Personal workspace",
    createdBy: userId,
    maxAllowedMemberships: PLANS.free.seats,
  });
  return { orgId: null, pending: org.id };
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, orgId, orgRole } = await auth.protect();
  const ws = await activeWorkspace(userId, orgId);
  if (ws.pending) return <ActivateWorkspace organizationId={ws.pending} />;

  const isAdmin = orgRole === "org:admin";
  const [ent, row] = await Promise.all([
    workspaceEntitlements(ws.orgId!),
    isAdmin ? billingRow(ws.orgId!) : undefined,
  ]);
  // Past-due subs are fixed in the portal, so they get Manage, not Upgrade.
  const billing = isAdmin
    ? {
        canUpgrade: ent.plan === "free" && !hasLiveSubscription(row),
        canManage: !!row?.stripe_customer_id,
      }
    : undefined;

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Logo href="/dashboard" />
          <Separator orientation="vertical" className="h-5!" />
          <OrganizationSwitcher
            hidePersonal
            afterSelectOrganizationUrl="/dashboard"
            afterCreateOrganizationUrl="/dashboard"
          />
          <NavLinks />
          <div className="ml-auto flex items-center gap-3">
            <UsageMeter entitlements={ent} billing={billing} />
            <UserButton />
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
