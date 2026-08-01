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
    <div className="overflow-hidden border border-ink-700">
      <div className="hidden grid-cols-[1.2fr_auto_1.6fr] gap-x-4 border-b border-ink-700 bg-ink-900/70 px-4 py-2 text-xs tracking-wide text-ink-400 uppercase md:grid">
        <span>Dimension</span>
        <span>Grade</span>
        <span>Note</span>
      </div>
      <ul>
        {rows.map((row) => (
          <li
            key={row.label}
            className="grid gap-1 border-b border-ink-800 px-4 py-3 last:border-b-0 md:grid-cols-[1.2fr_auto_1.6fr] md:items-start md:gap-x-4"
          >
            <span className="text-sm text-ink-200">{row.label}</span>
            <span className="font-display text-lg text-meta-bright">
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
