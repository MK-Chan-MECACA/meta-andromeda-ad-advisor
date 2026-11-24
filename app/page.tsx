"use client";

import { useRef, useState } from "react";
import { IntakePanel } from "@/components/IntakePanel";
import { MetaImportPanel } from "@/components/MetaImportPanel";
import { ResultsDashboard } from "@/components/ResultsDashboard";
import { IconLoader, IconSpark } from "@/components/Icons";
import type { AnalysisResult } from "@/lib/analysis-schema";
import { useIntakeDraft } from "@/lib/use-intake-draft";
import {
  type AnalyzeResponse,
} from "@/lib/types";

function AnalyzingState() {
  return (
    <div
      className="surface-glass animate-rise mt-8 overflow-hidden rounded-2xl px-5 py-5"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-meta/15 text-meta-bright">
          <IconLoader className="h-5 w-5 animate-spin" aria-hidden />
        </span>
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <p className="font-display text-sm tracking-wide text-meta-bright uppercase">
              Analyzing
            </p>
            <p className="mt-1 text-sm text-ink-200">
              Reading your assets through eligibility → Retrieval MoE → ranking
              → learning…
            </p>
          </div>
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-2.5 animate-pulse rounded-full bg-ink-700/80"
                style={{ width: `${92 - i * 18}%`, animationDelay: `${i * 120}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { form, setForm, savedAt, clearDraft } = useIntakeDraft();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  async function handleAnalyze() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: form.mode,
          images: form.images.map(({ dataUrl, kind, name }) => ({
            dataUrl,
            kind,
            name,
          })),
          copy: form.copy,
          setup: form.setup,
          metrics: form.metrics,
          signals: form.signals,
        }),
      });

      const data = (await res.json()) as AnalyzeResponse;

      if (!res.ok || !("analysis" in data)) {
        setError(
          "error" in data
            ? data.error
            : "Analysis failed. Check your XAI_API_KEY and try again.",
        );
        setAnalysis(null);
        return;
      }

      setAnalysis(data.analysis);
      requestAnimationFrame(() => {
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    } catch {
      setError("Network error talking to the analyzer.");
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  }

  function handleClearDraft() {
    clearDraft();
    setAnalysis(null);
    setError(null);
  }

  const draftLabel = savedAt
    ? `Draft saved ${new Date(savedAt).toLocaleString(undefined, {
        dateStyle: "short",
        timeStyle: "short",
      })}`
    : null;

  return (
    <div className="relative flex-1 overflow-x-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute inset-0 bg-[linear-gradient(165deg,#060a12_0%,#0b1220_42%,#0a1628_72%,#060a12_100%)]" />
        <div className="animate-blob absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.28),transparent_68%)]" />
        <div className="animate-blob absolute top-[35%] -right-32 h-[360px] w-[360px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(217,119,6,0.12),transparent_70%)] [animation-delay:2s]" />
        <div className="absolute inset-0 opacity-[0.045] [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:72px_72px]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink-950 to-transparent" />
      </div>

      <main className="relative mx-auto w-full max-w-6xl px-5 pt-10 pb-24 sm:px-8 sm:pt-14">
        <header className="mb-10 max-w-3xl animate-rise">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-meta/30 bg-meta/10 px-3 py-1.5 text-xs text-meta-bright">
            <IconSpark className="h-3.5 w-3.5" aria-hidden />
            <span className="font-display tracking-[0.18em] uppercase">
              Retrieval MoE gatekeeper
            </span>
          </div>
          <h1 className="font-display text-5xl leading-[0.95] tracking-tight text-ink-50 sm:text-7xl">
            ANDROMEDA
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-300 sm:text-lg">
            I score every eligible ad. Upload creative, paste copy, or drop an
            Ads Manager screenshot — I diagnose MoE retrieval, expert coverage,
            auction fit, and learning so you can maximize conversion.
          </p>
          {draftLabel ? (
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-ink-400">
              <span>{draftLabel} (local)</span>
              <button
                type="button"
                onClick={handleClearDraft}
                className="cursor-pointer text-meta-bright underline-offset-2 hover:underline"
              >
                Clear draft
              </button>
            </div>
          ) : null}
        </header>

        <div className="animate-rise-delay mb-6">
          <MetaImportPanel form={form} onChange={setForm} />
        </div>

        <div className="surface-glass animate-rise-delay rounded-2xl p-5 sm:p-8">
          <IntakePanel
            form={form}
            onChange={setForm}
            onAnalyze={() => void handleAnalyze()}
            loading={loading}
            error={error}
          />
        </div>

        {loading ? <AnalyzingState /> : null}

        {analysis ? (
          <div ref={resultsRef} className="mt-12 animate-rise-slow">
            <ResultsDashboard analysis={analysis} />
          </div>
        ) : null}
      </main>
    </div>
  );
}
