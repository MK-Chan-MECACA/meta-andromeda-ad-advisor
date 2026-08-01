import type { AnalysisResult } from "@/lib/analysis-schema";

function liveLabel(value: AnalysisResult["scorecard"]["livePerformance"]) {
  switch (value) {
    case "Working":
      return "Working";
    case "NotWorking":
      return "Not working";
    case "Learning":
      return "Learning";
    default:
      return "Unknown";
  }
}

function gradeTone(grade: string) {
  if (/^[AB]/.test(grade) || grade === "Working") return "text-pass";
  if (/^[CD]/.test(grade) || grade === "Learning") return "text-warn";
  if (/^[EF]/.test(grade) || grade === "Not working") return "text-danger";
  return "text-meta-bright";
}

export function Scorecard({
  scorecard,
}: {
  scorecard: AnalysisResult["scorecard"];
}) {
  const rows = [
    {
      label: "Setup Andromeda-aligned?",
      grade: scorecard.setupAlignment,
      note: scorecard.setupAlignmentNote,
    },
    {
      label: "Creative diversity",
      grade: scorecard.creativeDiversity,
      note: scorecard.creativeDiversityNote,
    },
    {
      label: "Objective ↔ offer fit",
      grade: scorecard.objectiveOfferFit,
      note: scorecard.objectiveOfferFitNote,
    },
    {
      label: "Live performance",
      grade: liveLabel(scorecard.livePerformance),
      note: scorecard.livePerformanceNote,
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-ink-700 bg-ink-900/40">
      <div className="hidden grid-cols-[1.2fr_auto_1.6fr] gap-x-4 border-b border-ink-700 bg-ink-900/80 px-5 py-3 text-xs tracking-wide text-ink-400 uppercase md:grid">
        <span>Dimension</span>
        <span>Grade</span>
        <span>Note</span>
      </div>
      <ul>
        {rows.map((row) => (
          <li
            key={row.label}
            className="grid gap-1 border-b border-ink-800 px-5 py-4 last:border-b-0 md:grid-cols-[1.2fr_auto_1.6fr] md:items-start md:gap-x-4"
          >
            <span className="text-sm font-medium text-ink-200">{row.label}</span>
            <span
              className={`font-display text-lg ${gradeTone(String(row.grade))}`}
            >
              {row.grade}
            </span>
            <span className="text-sm leading-relaxed text-ink-300">
              {row.note}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
