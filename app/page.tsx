"use client";

import { useRef, useState } from "react";
import { IntakePanel } from "@/components/IntakePanel";
import { MetaImportPanel } from "@/components/MetaImportPanel";
import { ResultsDashboard } from "@/components/ResultsDashboard";
import type { AnalysisResult } from "@/lib/analysis-schema";
import {
  emptyIntakeForm,
  type AnalyzeResponse,
  type IntakeFormState,
} from "@/lib/types";

export default function Home() {
  const [form, setForm] = useState<IntakeFormState>(emptyIntakeForm);
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
          images: form.images.map(({ dataUrl, kind, name }) => ({
            dataUrl,
            kind,
            name,
          })),
          copy: form.copy,
          setup: form.setup,
          metrics: form.metrics,
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

  return (
    <div className="relative flex-1">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-32 left-1/2 h-[480px] w-[900px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(6,104,225,0.22),transparent_65%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#07090e_0%,#0c111a_45%,#07090e_100%)]" />
        <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:64px_64px]" />
      </div>

      <main className="relative mx-auto w-full max-w-6xl px-5 pt-10 pb-20 sm:px-8 sm:pt-14">
        <header className="mb-10 max-w-3xl animate-rise">
          <p className="font-display text-xs tracking-[0.28em] text-meta-bright uppercase">
            Meta retrieval gatekeeper
          </p>
          <h1 className="mt-3 font-display text-5xl leading-none tracking-tight text-ink-50 sm:text-7xl">
            ANDROMEDA
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-300 sm:text-lg">
            Upload creative, paste copy, or drop an Ads Manager screenshot — I
            score retrieval, auction fit, and learning so you can maximize
            conversion.
          </p>
        </header>

        <div className="animate-rise-delay mb-6">
          <MetaImportPanel form={form} onChange={setForm} />
        </div>

        <div className="animate-rise-delay border border-ink-700/80 bg-ink-950/55 p-5 backdrop-blur-sm sm:p-8">
          <IntakePanel
            form={form}
            onChange={setForm}
            onAnalyze={() => void handleAnalyze()}
            loading={loading}
            error={error}
          />
        </div>

        {loading ? (
          <div className="mt-8 border border-meta/30 bg-meta/5 px-5 py-4 text-sm text-ink-200">
            Reading your assets through retrieval → ranking → learning…
          </div>
        ) : null}

        {analysis ? (
          <div ref={resultsRef} className="mt-12 animate-rise">
            <ResultsDashboard analysis={analysis} />
          </div>
        ) : null}
      </main>
    </div>
  );
}
