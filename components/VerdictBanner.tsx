import type { AnalysisResult } from "@/lib/analysis-schema";

const verdictStyles: Record<
  AnalysisResult["verdict"],
  { label: string; className: string; glow: string }
> = {
  PASS: {
    label: "PASS",
    className: "border-pass/40 bg-pass/10 text-pass",
    glow: "shadow-[0_0_48px_rgba(34,197,94,0.12)]",
  },
  AT_RISK: {
    label: "AT RISK",
    className: "border-warn/40 bg-warn/10 text-warn",
    glow: "shadow-[0_0_48px_rgba(217,119,6,0.12)]",
  },
  FAIL: {
    label: "FAIL",
    className: "border-danger/40 bg-danger/10 text-danger",
    glow: "shadow-[0_0_48px_rgba(239,68,68,0.12)]",
  },
  UNKNOWN: {
    label: "UNKNOWN",
    className: "border-ink-500/40 bg-ink-800/70 text-ink-200",
    glow: "",
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
    <div
      className={`rounded-2xl border px-5 py-7 sm:px-8 ${style.className} ${style.glow}`}
    >
      <p className="font-display text-xs tracking-[0.22em] uppercase opacity-80">
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
