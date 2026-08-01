"use client";

import type { AnalysisResult } from "@/lib/analysis-schema";
import { VerdictBanner } from "@/components/VerdictBanner";
import { Scorecard } from "@/components/Scorecard";
import { FixesList } from "@/components/FixesList";

function StageBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h3 className="font-display text-sm tracking-wide text-ink-100 uppercase">
        {title}
      </h3>
      <div className="space-y-2 text-sm leading-relaxed text-ink-300">
        {children}
      </div>
    </div>
  );
}

function BulletList({
  items,
  tone,
}: {
  items: string[];
  tone: "good" | "bad";
}) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li
          key={item}
          className={[
            "border-l-2 px-3 py-2 text-sm leading-relaxed",
            tone === "good"
              ? "border-pass bg-pass/5 text-ink-100"
              : "border-danger bg-danger/5 text-ink-100",
          ].join(" ")}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

export function ResultsDashboard({ analysis }: { analysis: AnalysisResult }) {
  const { retrieval, ranking, learning, eligibility, scorecard } = analysis;

  return (
    <section className="space-y-10" aria-label="Analysis results">
      <VerdictBanner
        verdict={analysis.verdict}
        bottomLine={analysis.bottomLine}
      />

      <div className="space-y-3">
        <h2 className="font-display text-xl text-ink-50">Scorecard</h2>
        <Scorecard scorecard={scorecard} />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          <h2 className="font-display text-xl text-pass">What went well</h2>
          <BulletList items={analysis.whatWentWell} tone="good" />
        </div>
        <div className="space-y-3">
          <h2 className="font-display text-xl text-danger">What went wrong</h2>
          <BulletList items={analysis.whatWentWrong} tone="bad" />
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <StageBlock title="Stage 0 — Eligibility">
          <p>{eligibility.summary}</p>
          {eligibility.blockers.length > 0 ? (
            <ul className="list-disc space-y-1 pl-5 text-warn">
              {eligibility.blockers.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          ) : (
            <p className="text-ink-500">No hard blockers noted.</p>
          )}
        </StageBlock>

        <StageBlock title="Stage 1 — Retrieval (ticket)">
          <p>
            <span className="text-ink-500">Semantic node:</span>{" "}
            {retrieval.semanticNode}
          </p>
          <p>
            <span className="text-ink-500">Ticket count:</span>{" "}
            {retrieval.ticketCount} — {retrieval.ticketRationale}
          </p>
          <p>
            <span className="text-ink-500">Cage check:</span>{" "}
            {retrieval.cageCheck}
          </p>
          <p>
            <span className="text-ink-500">Congruence:</span>{" "}
            {retrieval.congruence}
          </p>
          <p>
            <span className="text-ink-500">Grade:</span>{" "}
            <span className="font-display text-meta-bright">
              {retrieval.grade}
            </span>
          </p>
        </StageBlock>

        <StageBlock title="Stage 2 — Ranking & auction">
          <p>
            <span className="text-ink-500">EAR fit:</span> {ranking.earFit}
          </p>
          <p>
            <span className="text-ink-500">Quality / thumb-stop:</span>{" "}
            {ranking.quality}
          </p>
          <p>
            <span className="text-ink-500">Formula risk:</span>{" "}
            {ranking.formulaRisk}
          </p>
        </StageBlock>

        <StageBlock title="Learning & timing">
          <p>{learning.summary}</p>
          <p>
            <span className="text-ink-500">Budget guidance:</span>{" "}
            {learning.budgetGuidance}
          </p>
        </StageBlock>
      </div>

      <div className="space-y-3">
        <h2 className="font-display text-xl text-ink-50">
          Fixes (priority order)
        </h2>
        <FixesList fixes={analysis.fixes} />
      </div>

      {analysis.missingInputs.length > 0 ? (
        <div className="space-y-3 border border-ink-700 bg-ink-900/30 px-5 py-5">
          <h2 className="font-display text-sm tracking-wide text-ink-100 uppercase">
            What I still need
          </h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-ink-300">
            {analysis.missingInputs.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
