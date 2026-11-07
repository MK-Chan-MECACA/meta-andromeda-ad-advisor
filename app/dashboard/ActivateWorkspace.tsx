"use client";

import { useEffect } from "react";
import { useOrganizationList } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

/** Makes the given workspace active for this session, then reloads the dashboard. */
export function ActivateWorkspace({ organizationId }: { organizationId: string }) {
  const { isLoaded, setActive } = useOrganizationList();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    void setActive({ organization: organizationId }).then(() => router.refresh());
  }, [isLoaded, setActive, organizationId, router]);

  return (
    <main className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
      Preparing your workspace…
    </main>
  );
}
