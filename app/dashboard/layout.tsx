import Link from "next/link";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { PLANS } from "@/lib/entitlements";
import { workspaceEntitlements } from "@/lib/workspace";
import { UsageMeter } from "@/components/UsageMeter";
import { ActivateWorkspace } from "./ActivateWorkspace";

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
  const { userId, orgId } = await auth.protect();
  const ws = await activeWorkspace(userId, orgId);
  if (ws.pending) return <ActivateWorkspace organizationId={ws.pending} />;

  const ent = await workspaceEntitlements(ws.orgId!);

  return (
    <div className="flex flex-1 flex-col">
      <nav className="relative z-10 flex flex-wrap items-center gap-4 border-b border-ink-800 bg-ink-950/80 px-5 py-3 sm:px-8">
        <OrganizationSwitcher
          hidePersonal
          afterSelectOrganizationUrl="/dashboard"
          afterCreateOrganizationUrl="/dashboard"
        />
        <Link href="/dashboard" className="text-sm text-ink-200 hover:text-ink-50">
          Analyze
        </Link>
        <Link
          href="/dashboard/history"
          className="text-sm text-ink-200 hover:text-ink-50"
        >
          History
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <UsageMeter entitlements={ent} />
          <UserButton />
        </div>
      </nav>
      {children}
    </div>
  );
}
