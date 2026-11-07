"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** Admin-only billing actions: Upgrade (Free) and/or Manage billing (has a Stripe customer). */
export function BillingButton({
  canUpgrade,
  canManage,
}: {
  canUpgrade: boolean;
  canManage: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go(path: string, body?: object) {
    setBusy(true);
    setError(null);
    const res = await fetch(path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body ?? {}),
    });
    const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
    if (data.url) return window.location.assign(data.url);
    setError(data.error ?? "Billing is unavailable right now.");
    setBusy(false);
  }

  return (
    <div className="flex items-center gap-2">
      {canUpgrade && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" disabled={busy}>
              Upgrade
              <ChevronDown data-icon="inline-end" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={() => go("/api/billing/checkout", { interval: "month" })}
            >
              Pro · RM 99 / month
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => go("/api/billing/checkout", { interval: "year" })}
            >
              Pro · RM 990 / year
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {canManage && (
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => go("/api/billing/portal")}
        >
          Manage billing
        </Button>
      )}
      {error && <span className="text-xs text-warn">{error}</span>}
    </div>
  );
}
