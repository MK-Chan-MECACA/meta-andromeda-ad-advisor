import type { AnalysisResult } from "@/lib/analysis-schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  if (/^[EF]/.test(grade) || grade === "Not working") return "text-fail";
  return "text-muted-foreground";
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="md:w-56">Dimension</TableHead>
          <TableHead className="w-24">Grade</TableHead>
          <TableHead className="hidden md:table-cell">Note</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.label}>
            <TableCell className="align-top whitespace-normal">
              <span className="font-medium">{row.label}</span>
              <p className="mt-1 text-muted-foreground md:hidden">{row.note}</p>
            </TableCell>
            <TableCell
              className={`align-top font-mono font-semibold ${gradeTone(String(row.grade))}`}
            >
              {row.grade}
            </TableCell>
            <TableCell className="hidden align-top whitespace-normal text-muted-foreground md:table-cell">
              {row.note}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
