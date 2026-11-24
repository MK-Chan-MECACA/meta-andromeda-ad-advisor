"use client";

import type { AnalysisResult } from "@/lib/analysis-schema";

function gradeTone(grade: string) {
  if (/^[AB]/.test(grade)) return "text-pass";
  if (/^[CD]/.test(grade)) return "text-warn";
  return "text-danger";
}

export function DiversityMatrix({
  portfolio,
}: {
  portfolio: AnalysisResult["portfolio"];
}) {
  const dims = [
    { key: "Format", value: portfolio.diversityMatrix.format },
    { key: "Persona", value: portfolio.diversityMatrix.persona },
    { key: "Environment", value: portfolio.diversityMatrix.environment },
    { key: "Benefit", value: portfolio.diversityMatrix.benefit },
  ] as const;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-display text-lg text-ink-50">
            Diversity matrix
          </h3>
          <p className="mt-1 text-sm text-ink-400">{portfolio.summary}</p>
        </div>
        <div className="rounded-xl border border-ink-700 bg-ink-900/50 px-4 py-2 text-right">
          <p className="font-display text-[11px] tracking-wide text-ink-400 uppercase">
            True tickets
          </p>
          <p className="font-display text-2xl text-meta-bright tabular-nums">
            {portfolio.trueTicketCount}
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {dims.map((d) => (
          <div
            key={d.key}
            className="rounded-2xl border border-ink-700 bg-ink-900/35 p-4"
          >
            <p className="font-display text-[11px] tracking-wide text-ink-400 uppercase">
              {d.key}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-200">{d.value}</p>
          </div>
        ))}
      </div>

      <p className="text-sm text-ink-300">
        Diversification grade:{" "}
        <span
          className={`font-display text-lg ${gradeTone(portfolio.diversityMatrix.grade)}`}
        >
          {portfolio.diversityMatrix.grade}
        </span>
        <span className="text-ink-500">
          {" "}
          · Format × Persona × Environment × Benefit
        </span>
      </p>

      <div className="overflow-hidden rounded-2xl border border-ink-700 bg-ink-900/40">
        <div className="border-b border-ink-700 px-5 py-3 font-display text-xs tracking-wide text-ink-400 uppercase">
          Ticket clusters
        </div>
        <ul className="divide-y divide-ink-800">
          {portfolio.clusters.map((cluster) => (
            <li
              key={`${cluster.label}-${cluster.members.join(",")}`}
              className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-ink-100">
                    {cluster.label}
                  </span>
                  <span
                    className={[
                      "rounded-md px-2 py-0.5 font-display text-[10px] tracking-wide uppercase",
                      cluster.isDistinctTicket
                        ? "bg-pass/15 text-pass"
                        : "bg-warn/15 text-warn",
                    ].join(" ")}
                  >
                    {cluster.isDistinctTicket
                      ? "Distinct ticket"
                      : "Collapsed"}
                  </span>
                </div>
                <p className="text-sm text-ink-400">
                  {cluster.members.join(" · ")}
                </p>
                <p className="text-sm text-ink-300">{cluster.note}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {portfolio.collapsedDuplicates.length > 0 ? (
        <div className="rounded-xl border border-warn/25 bg-warn/5 px-4 py-3 text-sm text-ink-200">
          <p className="font-display text-xs tracking-wide text-warn uppercase">
            Near-duplicates collapsed
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {portfolio.collapsedDuplicates.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
