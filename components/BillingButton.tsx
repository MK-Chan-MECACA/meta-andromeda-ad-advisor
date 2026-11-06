"use client";

import { useState } from "react";

const btn =
  "rounded-lg border border-meta/40 px-2.5 py-1 text-xs text-meta-bright hover:bg-meta/10 disabled:opacity-50";

/** Admin-only billing actions: Upgrade (Free) and/or Manage billing (has a Stripe customer). */
export function BillingButton({
  canUpgrade,
  canManage,
}: {
  canUpgrade: boolean;
  canManage: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [choosing, setChoosing] = useState(false);
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
      {canUpgrade &&
        (choosing ? (
          <>
            <button type="button" disabled={busy} className={btn}
              onClick={() => go("/api/billing/checkout", { interval: "month" })}>
              RM 99 / month
            </button>
            <button type="button" disabled={busy} className={btn}
              onClick={() => go("/api/billing/checkout", { interval: "year" })}>
              RM 990 / year
            </button>
          </>
        ) : (
          <button type="button" className={`${btn} bg-meta/10`} onClick={() => setChoosing(true)}>
            Upgrade
          </button>
        ))}
      {canManage && (
        <button type="button" disabled={busy} className={btn}
          onClick={() => go("/api/billing/portal")}>
          Manage billing
        </button>
      )}
      {error && <span className="text-amber-400">{error}</span>}
    </div>
  );
}
