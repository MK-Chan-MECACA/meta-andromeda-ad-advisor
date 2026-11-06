"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteAnalysisButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [armed, setArmed] = useState(false);

  async function remove() {
    setBusy(true);
    const res = await fetch(`/api/analyses/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/dashboard/history");
      router.refresh();
    } else {
      setBusy(false);
      setArmed(false);
    }
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => (armed ? void remove() : setArmed(true))}
      className="rounded-lg border border-rose-500/40 px-3 py-1.5 text-xs text-rose-300 hover:bg-rose-500/10 disabled:opacity-50"
    >
      {busy ? "Deleting…" : armed ? "Click again to delete" : "Delete"}
    </button>
  );
}
