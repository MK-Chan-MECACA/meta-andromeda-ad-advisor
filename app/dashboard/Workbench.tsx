"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { IntakePanel } from "@/components/IntakePanel";
import { MetaImportPanel } from "@/components/MetaImportPanel";
import { ResultsDashboard } from "@/components/ResultsDashboard";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnalysisResult } from "@/lib/analysis-schema";
import { uploadThumbnail } from "@/lib/thumbnail";
import {
  emptyIntakeForm,
  type AnalyzeResponse,
  type IntakeFormState,
} from "@/lib/types";

function AnalyzingState() {
  return (
    <Card role="status" aria-live="polite">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Loader2 className="size-4 animate-spin text-primary" aria-hidden />
          Analyzing
        </CardTitle>
        <CardDescription>Reading your assets through retrieval → ranking → learning…</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardContent>
    </Card>
  );
}

export function Workbench() {
  const router = useRouter();
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
          metaAdId: form.metaAdId,
        }),
      });

      const data = (await res.json()) as AnalyzeResponse;

      if (!res.ok || !("analysis" in data)) {
        setError(
          "error" in data
            ? data.error
            : "Analysis failed. Please try again.",
        );
        setAnalysis(null);
        return;
      }

      setAnalysis(data.analysis);
      if (form.images[0]) uploadThumbnail(data.id, form.images[0].dataUrl);
      router.refresh(); // update usage meter
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
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">New analysis</h1>
        <p className="text-sm text-muted-foreground">
          Add creative, copy, setup or an Ads Manager screenshot. Andromeda scores
          retrieval, auction fit and learning, then ranks the fixes.
        </p>
      </header>

      <MetaImportPanel form={form} onChange={setForm} />

      <IntakePanel
        form={form}
        onChange={setForm}
        onAnalyze={() => void handleAnalyze()}
        loading={loading}
        error={error}
      />

      {loading ? <AnalyzingState /> : null}

      {analysis ? (
        <div ref={resultsRef} className="scroll-mt-20">
          <ResultsDashboard analysis={analysis} />
        </div>
      ) : null}
    </main>
  );
}
