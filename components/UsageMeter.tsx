import type { Entitlements } from "@/lib/entitlements";

/** Plan badge + analyses used this period. */
export function UsageMeter({ entitlements: e }: { entitlements: Entitlements }) {
  const pct = Math.min(100, Math.round((e.used / e.quota) * 100));
  return (
    <div className="flex items-center gap-3 text-xs text-ink-300">
      <span className="rounded-full border border-meta/30 bg-meta/10 px-2 py-0.5 font-display tracking-wider text-meta-bright uppercase">
        {e.plan}
      </span>
      <div className="w-28" title={`${e.used} of ${e.quota} analyses used this period`}>
        <div className="h-1.5 overflow-hidden rounded-full bg-ink-700">
          <div
            className={`h-full ${e.allowed ? "bg-meta" : "bg-amber-500"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-1">
          {e.used}/{e.quota} analyses
        </p>
      </div>
      {e.reason === "seats" ? (
        <span className="text-amber-400">
          Over the {e.seats}-seat limit — remove members or upgrade.
        </span>
      ) : null}
    </div>
  );
}
