"use client";

import type { AnalysisResult } from "@/lib/analysis-schema";

function gradeTone(grade: string) {
  if (/^[AB]/.test(grade) || grade === "pass") return "text-pass";
  if (/^[CD]/.test(grade) || grade === "warn" || grade === "unknown")
    return "text-warn";
  return "text-danger";
}

function statusLabel(status: string) {
  switch (status) {
    case "pass":
      return "Pass";
    case "warn":
      return "Warn";
    case "fail":
      return "Fail";
    default:
      return "Unknown";
  }
}

export function SignalsPanel({
  signals,
}: {
  signals: AnalysisResult["signals"];
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-display text-lg text-ink-50">
          Signals & Advantage+
        </h3>
        <p className="mt-1 text-sm text-ink-400">
          How cleanly you train EAR and how much room you give automation.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-ink-700 bg-ink-900/35 p-5">
          <p className="font-display text-[11px] tracking-wide text-ink-400 uppercase">
            Advantage+ adoption
          </p>
          <p
            className={`mt-2 font-display text-3xl ${gradeTone(signals.advantagePlus.grade)}`}
          >
            {signals.advantagePlus.grade}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink-300">
            {signals.advantagePlus.note}
          </p>
        </div>
        <div className="rounded-2xl border border-ink-700 bg-ink-900/35 p-5">
          <p className="font-display text-[11px] tracking-wide text-ink-400 uppercase">
            Signal hygiene
          </p>
          <p
            className={`mt-2 font-display text-3xl ${gradeTone(signals.signalHygiene.grade)}`}
          >
            {signals.signalHygiene.grade}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink-300">
            {signals.signalHygiene.note}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-ink-700 bg-ink-900/35 p-5 text-sm text-ink-300">
          <p className="font-display text-[11px] tracking-wide text-ink-400 uppercase">
            Value optimization
          </p>
          <p className="mt-2 leading-relaxed">{signals.valueOptFit}</p>
        </div>
        <div className="rounded-2xl border border-ink-700 bg-ink-900/35 p-5 text-sm text-ink-300">
          <p className="font-display text-[11px] tracking-wide text-ink-400 uppercase">
            Post-click CX
          </p>
          <p className="mt-2 leading-relaxed">{signals.cxRisk}</p>
        </div>
      </div>

      <ul className="overflow-hidden rounded-2xl border border-ink-700 bg-ink-900/40">
        {signals.checklist.map((item) => (
          <li
            key={item.item}
            className="flex flex-col gap-1 border-b border-ink-800 px-5 py-4 last:border-b-0 sm:flex-row sm:items-start sm:gap-4"
          >
            <span
              className={`shrink-0 font-display text-xs tracking-wide uppercase ${gradeTone(item.status)}`}
            >
              {statusLabel(item.status)}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink-100">{item.item}</p>
              <p className="mt-1 text-sm text-ink-400">{item.note}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
