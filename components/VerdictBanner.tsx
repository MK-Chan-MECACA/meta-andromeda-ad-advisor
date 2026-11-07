import { CircleAlert, CircleCheck, CircleHelp, CircleX } from "lucide-react";
import type { AnalysisResult } from "@/lib/analysis-schema";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Verdict = AnalysisResult["verdict"];

const VERDICT: Record<Verdict, { label: string; tone: string; Icon: typeof CircleCheck }> = {
  PASS: { label: "Pass", tone: "bg-pass/15 text-pass", Icon: CircleCheck },
  AT_RISK: { label: "At risk", tone: "bg-warn/15 text-warn", Icon: CircleAlert },
  FAIL: { label: "Fail", tone: "bg-fail/15 text-fail", Icon: CircleX },
  UNKNOWN: { label: "Unknown", tone: "bg-muted text-muted-foreground", Icon: CircleHelp },
};

export function VerdictBadge({ verdict, className }: { verdict: string; className?: string }) {
  const v = VERDICT[verdict as Verdict] ?? VERDICT.UNKNOWN;
  return (
    <Badge className={cn(v.tone, className)}>
      <v.Icon data-icon="inline-start" />
      {v.label}
    </Badge>
  );
}

export function VerdictBanner({
  verdict,
  bottomLine,
}: {
  verdict: Verdict;
  bottomLine: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>Andromeda verdict</CardDescription>
        <CardTitle className="flex items-center gap-3 text-2xl font-semibold">
          <VerdictBadge verdict={verdict} className="h-7 px-3 text-sm" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="max-w-3xl text-base leading-relaxed">{bottomLine}</p>
      </CardContent>
    </Card>
  );
}
