import { Check, Info, X } from "lucide-react";
import type { AnalysisResult } from "@/lib/analysis-schema";
import { VerdictBanner } from "@/components/VerdictBanner";
import { Scorecard } from "@/components/Scorecard";
import { FixesList } from "@/components/FixesList";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function BulletList({ items, tone }: { items: string[]; tone: "good" | "bad" }) {
  const Icon = tone === "good" ? Check : X;
  return (
    <ul className="divide-y">
      {items.map((item) => (
        <li key={item} className="flex gap-3 py-2.5 first:pt-0 last:pb-0">
          <Icon
            className={`mt-0.5 size-4 shrink-0 ${tone === "good" ? "text-pass" : "text-fail"}`}
            aria-hidden
          />
          <span className="leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Label/value grid used inside each pipeline stage. */
function Fields({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <dl className="grid gap-x-4 gap-y-2.5 sm:grid-cols-[9rem_1fr]">
      {rows.map(([label, value]) => (
        <div key={label} className="contents">
          <dt className="text-muted-foreground">{label}</dt>
          <dd className="leading-relaxed">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ResultsDashboard({ analysis }: { analysis: AnalysisResult }) {
  const { retrieval, ranking, learning, eligibility, scorecard } = analysis;

  return (
    <section className="flex flex-col gap-4" aria-label="Analysis results">
      <VerdictBanner verdict={analysis.verdict} bottomLine={analysis.bottomLine} />

      <Section title="Scorecard">
        <Scorecard scorecard={scorecard} />
      </Section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="What went well">
          <BulletList items={analysis.whatWentWell} tone="good" />
        </Section>
        <Section title="What went wrong">
          <BulletList items={analysis.whatWentWrong} tone="bad" />
        </Section>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Section title="Stage 0 · Eligibility" description={eligibility.summary}>
          {eligibility.blockers.length > 0 ? (
            <ul className="flex flex-col gap-1.5">
              {eligibility.blockers.map((b) => (
                <li key={b} className="flex gap-2 text-warn">
                  <X className="mt-0.5 size-4 shrink-0" aria-hidden />
                  {b}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No hard blockers noted.</p>
          )}
        </Section>

        <Section title="Stage 1 · Retrieval">
          <Fields
            rows={[
              ["Grade", <Badge key="g" variant="secondary" className="font-mono">{retrieval.grade}</Badge>],
              ["Semantic node", retrieval.semanticNode],
              [
                "Ticket count",
                <>
                  <span className="font-mono tabular-nums">{retrieval.ticketCount}</span>
                  <span className="text-muted-foreground"> — {retrieval.ticketRationale}</span>
                </>,
              ],
              ["Cage check", retrieval.cageCheck],
              ["Congruence", retrieval.congruence],
            ]}
          />
        </Section>

        <Section title="Stage 2 · Ranking & auction">
          <Fields
            rows={[
              ["EAR fit", ranking.earFit],
              ["Quality / thumb-stop", ranking.quality],
              ["Formula risk", ranking.formulaRisk],
            ]}
          />
        </Section>

        <Section title="Learning & timing" description={learning.summary}>
          <Fields rows={[["Budget guidance", learning.budgetGuidance]]} />
        </Section>
      </div>

      <Section title="Fixes" description="In priority order.">
        <FixesList fixes={analysis.fixes} />
      </Section>

      {analysis.missingInputs.length > 0 ? (
        <Alert>
          <Info />
          <AlertTitle>What I still need</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-4">
              {analysis.missingInputs.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      ) : null}
    </section>
  );
}
