import type { AnalysisResult } from "@/lib/analysis-schema";

export function FixesList({ fixes }: { fixes: AnalysisResult["fixes"] }) {
  const ordered = [...fixes].sort((a, b) => a.priority - b.priority);

  return (
    <ol className="space-y-3">
      {ordered.map((fix) => (
        <li
          key={`${fix.priority}-${fix.action}`}
          className="grid grid-cols-[auto_1fr] gap-4 border border-ink-700 bg-ink-900/40 px-4 py-4"
        >
          <span className="font-display text-2xl text-meta-bright">
            {String(fix.priority).padStart(2, "0")}
          </span>
          <div>
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
