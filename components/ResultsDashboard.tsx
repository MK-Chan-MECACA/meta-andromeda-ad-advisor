"use client";

import type { AnalysisResult } from "@/lib/analysis-schema";
import { VerdictBanner } from "@/components/VerdictBanner";
import { Scorecard } from "@/components/Scorecard";
import { FixesList } from "@/components/FixesList";
import { IconCheck, IconX } from "@/components/Icons";

function StageBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-900/35 p-5 transition duration-200 hover:border-ink-500">
      <h3 className="font-display text-sm tracking-wide text-ink-100 uppercase">
        {title}
      </h3>
      <div className="mt-3 space-y-2 text-sm leading-relaxed text-ink-300">
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
            "flex gap-3 rounded-xl border px-3 py-3 text-sm leading-relaxed",
            tone === "good"
              ? "border-pass/25 bg-pass/5 text-ink-100"
              : "border-danger/25 bg-danger/5 text-ink-100",
          ].join(" ")}
        >
          <span
            className={[
              "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md",
              tone === "good"
                ? "bg-pass/15 text-pass"
                : "bg-danger/15 text-danger",
            ].join(" ")}
          >
            {tone === "good" ? (
              <IconCheck className="h-3.5 w-3.5" aria-hidden />
            ) : (
              <IconX className="h-3.5 w-3.5" aria-hidden />
            )}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <p>
      <span className="text-ink-500">{label}:</span> {value}
    </p>
  );
}

export function ResultsDashboard({ analysis }: { analysis: AnalysisResult }) {
  const { retrieval, ranking, learning, eligibility, scorecard } = analysis;

  return (
    <section className="space-y-10" aria-label="Analysis results">
      <div className="space-y-2">
        <p className="font-display text-xs tracking-[0.2em] text-meta-bright uppercase">
          Results
        </p>
        <h2 className="font-display text-2xl text-ink-50 sm:text-3xl">
          Diagnosis
        </h2>
      </div>

      <VerdictBanner
        verdict={analysis.verdict}
        bottomLine={analysis.bottomLine}
      />

      <div className="space-y-3">
        <h3 className="font-display text-lg text-ink-50">Scorecard</h3>
        <Scorecard scorecard={scorecard} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <h3 className="font-display text-lg text-pass">What went well</h3>
          <BulletList items={analysis.whatWentWell} tone="good" />
        </div>
        <div className="space-y-3">
          <h3 className="font-display text-lg text-danger">What went wrong</h3>
          <BulletList items={analysis.whatWentWrong} tone="bad" />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-display text-lg text-ink-50">Pipeline stages</h3>
        <div className="grid gap-4 md:grid-cols-2">
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
            <MetaRow label="Semantic node" value={retrieval.semanticNode} />
            <MetaRow
              label="Ticket count"
              value={
                <>
                  {retrieval.ticketCount} — {retrieval.ticketRationale}
                </>
              }
            />
            <MetaRow label="Cage check" value={retrieval.cageCheck} />
            <MetaRow label="Congruence" value={retrieval.congruence} />
            <MetaRow
              label="Grade"
              value={
                <span className="font-display text-meta-bright">
                  {retrieval.grade}
                </span>
              }
            />
          </StageBlock>

          <StageBlock title="Stage 2 — Ranking & auction">
            <MetaRow label="EAR fit" value={ranking.earFit} />
            <MetaRow label="Quality / thumb-stop" value={ranking.quality} />
            <MetaRow label="Formula risk" value={ranking.formulaRisk} />
          </StageBlock>

          <StageBlock title="Learning & timing">
            <p>{learning.summary}</p>
            <MetaRow label="Budget guidance" value={learning.budgetGuidance} />
          </StageBlock>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-display text-lg text-ink-50">
          Fixes (priority order)
        </h3>
        <FixesList fixes={analysis.fixes} />
      </div>

      {analysis.missingInputs.length > 0 ? (
        <div className="rounded-2xl border border-ink-700 bg-ink-900/30 px-5 py-5">
          <h3 className="font-display text-sm tracking-wide text-ink-100 uppercase">
            What I still need
          </h3>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink-300">
            {analysis.missingInputs.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
