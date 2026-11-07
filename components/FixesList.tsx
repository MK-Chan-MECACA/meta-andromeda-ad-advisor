import type { AnalysisResult } from "@/lib/analysis-schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function FixesList({ fixes }: { fixes: AnalysisResult["fixes"] }) {
  const ordered = [...fixes].sort((a, b) => a.priority - b.priority);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">#</TableHead>
          <TableHead className="md:w-2/5">Action</TableHead>
          <TableHead className="hidden md:table-cell">Why</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ordered.map((fix) => (
          <TableRow key={`${fix.priority}-${fix.action}`}>
            <TableCell className="align-top font-mono text-muted-foreground tabular-nums">
              {String(fix.priority).padStart(2, "0")}
            </TableCell>
            <TableCell className="align-top font-medium whitespace-normal">
              {fix.action}
              <p className="mt-1 font-normal text-muted-foreground md:hidden">{fix.why}</p>
            </TableCell>
            <TableCell className="hidden align-top whitespace-normal text-muted-foreground md:table-cell">
              {fix.why}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
