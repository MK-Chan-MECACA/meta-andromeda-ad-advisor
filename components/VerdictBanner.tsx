import type { AnalysisResult } from "@/lib/analysis-schema";

const verdictStyles: Record<
  AnalysisResult["verdict"],
  { label: string; className: string }
> = {
  PASS: {
    label: "PASS",
    className: "border-pass/50 bg-pass/10 text-pass",
  },
  AT_RISK: {
    label: "AT RISK",
    className: "border-warn/50 bg-warn/10 text-warn",
  },
  FAIL: {
    label: "FAIL",
    className: "border-danger/50 bg-danger/10 text-danger",
  },
  UNKNOWN: {
    label: "UNKNOWN",
    className: "border-ink-500/50 bg-ink-800/60 text-ink-200",
  },
};

export function VerdictBanner({
  verdict,
  bottomLine,
}: {
  verdict: AnalysisResult["verdict"];
  bottomLine: string;
}) {
  const style = verdictStyles[verdict];

  return (
    <div className={`border px-5 py-6 sm:px-8 ${style.className}`}>
      <p className="font-display text-xs tracking-[0.2em] uppercase opacity-80">
        Andromeda verdict
      </p>
      <p className="mt-2 font-display text-4xl tracking-tight sm:text-5xl">
        {style.label}
      </p>
      <p className="mt-4 max-w-3xl text-base leading-relaxed text-ink-50/95">
        {bottomLine}
      </p>
    </div>
  );
}
