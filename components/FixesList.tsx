import type { AnalysisResult } from "@/lib/analysis-schema";

export function FixesList({ fixes }: { fixes: AnalysisResult["fixes"] }) {
  const ordered = [...fixes].sort((a, b) => a.priority - b.priority);

  return (
    <ol className="space-y-3">
      {ordered.map((fix, index) => (
        <li
          key={`${fix.priority}-${fix.action}`}
          className="grid grid-cols-[auto_1fr] gap-4 rounded-2xl border border-ink-700 bg-ink-900/40 px-4 py-4 transition duration-200 hover:border-meta/35 hover:bg-ink-900/70"
          style={{ animationDelay: `${index * 60}ms` }}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/15 font-display text-lg text-accent-bright">
            {String(fix.priority).padStart(2, "0")}
          </span>
          <div className="min-w-0 pt-0.5">
            <p className="text-base font-medium text-ink-50">{fix.action}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-300">
              {fix.why}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
