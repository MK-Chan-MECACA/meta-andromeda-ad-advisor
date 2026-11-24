"use client";

import { useId, useState } from "react";
import { ImageDropzone } from "@/components/ImageDropzone";
import {
  IconArrowLeft,
  IconArrowRight,
  IconChart,
  IconCheck,
  IconImage,
  IconLoader,
  IconSliders,
  IconSpark,
  IconType,
} from "@/components/Icons";
import type { AnalysisMode, ClientImage, IntakeFormState } from "@/lib/types";
import {
  MAX_CREATIVE_IMAGES,
  MAX_IMAGES,
  MAX_SCREENSHOT_IMAGES,
} from "@/lib/analysis-schema";

type Props = {
  form: IntakeFormState;
  onChange: (next: IntakeFormState) => void;
  onAnalyze: () => void;
  loading: boolean;
  error: string | null;
};

const STEPS = [
  {
    id: "assets",
    label: "Assets",
    hint: "Creative & screenshots",
    Icon: IconImage,
  },
  {
    id: "copy",
    label: "Copy",
    hint: "Text that ships with the ad",
    Icon: IconType,
  },
  {
    id: "setup",
    label: "Setup",
    hint: "Objective & targeting",
    Icon: IconSliders,
  },
  {
    id: "metrics",
    label: "Signals",
    hint: "Pixel, EMQ, Advantage+ & results",
    Icon: IconChart,
  },
] as const;

type StepId = (typeof STEPS)[number]["id"];

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-xs font-medium tracking-wide text-ink-300 uppercase"
      >
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-ink-400">{hint}</p> : null}
    </div>
  );
}

export function IntakePanel({
  form,
  onChange,
  onAnalyze,
  loading,
  error,
}: Props) {
  const baseId = useId();
  const [step, setStep] = useState<StepId>("assets");
  const stepIndex = STEPS.findIndex((s) => s.id === step);

  const setMode = (mode: AnalysisMode) => onChange({ ...form, mode });
  const setCopy = (key: keyof IntakeFormState["copy"], value: string) =>
    onChange({ ...form, copy: { ...form.copy, [key]: value } });
  const setSetup = (key: keyof IntakeFormState["setup"], value: string) =>
    onChange({ ...form, setup: { ...form.setup, [key]: value } });
  const setMetrics = (key: keyof IntakeFormState["metrics"], value: string) =>
    onChange({ ...form, metrics: { ...form.metrics, [key]: value } });
  const setSignals = (key: keyof IntakeFormState["signals"], value: string) =>
    onChange({ ...form, signals: { ...form.signals, [key]: value } });

  const addImages = (images: ClientImage[]) => {
    const next = [...form.images, ...images].slice(0, MAX_IMAGES);
    const creatives = next.filter((i) => i.kind === "creative").length;
    onChange({
      ...form,
      images: next,
      mode: creatives > 1 ? "portfolio" : form.mode,
    });
  };

  const removeImage = (id: string) => {
    const images = form.images.filter((img) => img.id !== id);
    const creatives = images.filter((i) => i.kind === "creative").length;
    onChange({
      ...form,
      images,
      mode: creatives > 1 ? "portfolio" : form.mode,
    });
  };

  const creativeCount = form.images.filter((i) => i.kind === "creative").length;

  const goNext = () => {
    if (stepIndex < STEPS.length - 1) setStep(STEPS[stepIndex + 1].id);
  };
  const goBack = () => {
    if (stepIndex > 0) setStep(STEPS[stepIndex - 1].id);
  };

  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  return (
    <section className="space-y-8" aria-label="Ad intake">
      <div className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-display text-xs tracking-[0.2em] text-meta-bright uppercase">
              Intake · Step {stepIndex + 1} of {STEPS.length}
            </p>
            <h2 className="mt-1 font-display text-xl text-ink-50 sm:text-2xl">
              {STEPS[stepIndex].label}
            </h2>
            <p className="mt-1 text-sm text-ink-300">{STEPS[stepIndex].hint}</p>
          </div>
          <p className="font-display text-sm text-ink-400 tabular-nums">
            {Math.round(progress)}%
          </p>
        </div>

        <div
          className="h-1.5 overflow-hidden rounded-full bg-ink-800"
          role="progressbar"
          aria-valuenow={stepIndex + 1}
          aria-valuemin={1}
          aria-valuemax={STEPS.length}
          aria-label="Intake progress"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-meta-deep via-meta to-accent transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {STEPS.map((s, i) => {
            const active = s.id === step;
            const done = i < stepIndex;
            const Icon = s.Icon;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setStep(s.id)}
                  className={[
                    "flex w-full cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition duration-200",
                    active
                      ? "border-meta/50 bg-meta/10 shadow-[0_0_24px_rgba(37,99,235,0.12)]"
                      : done
                        ? "border-pass/30 bg-pass/5 hover:border-pass/50"
                        : "border-ink-700 bg-ink-950/40 hover:border-ink-500",
                  ].join(" ")}
                  aria-current={active ? "step" : undefined}
                >
                  <span
                    className={[
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      active
                        ? "bg-meta/20 text-meta-bright"
                        : done
                          ? "bg-pass/15 text-pass"
                          : "bg-ink-800 text-ink-400",
                    ].join(" ")}
                  >
                    {done ? (
                      <IconCheck className="h-4 w-4" aria-hidden />
                    ) : (
                      <Icon className="h-4 w-4" aria-hidden />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-ink-50">
                      {s.label}
                    </span>
                    <span className="hidden truncate text-xs text-ink-400 sm:block">
                      {s.hint}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <div key={step} className="animate-rise space-y-6">
        {step === "assets" ? (
          <div className="space-y-6">
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label="Analysis mode"
            >
              {(
                [
                  {
                    id: "single" as const,
                    label: "Single ad",
                    hint: "One concept diagnosis",
                  },
                  {
                    id: "portfolio" as const,
                    label: "Portfolio",
                    hint: "Diversity matrix + ticket collapse",
                  },
                ] as const
              ).map((opt) => {
                const active = form.mode === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setMode(opt.id)}
                    className={[
                      "cursor-pointer rounded-xl border px-4 py-3 text-left transition duration-200",
                      active
                        ? "border-meta/50 bg-meta/10 shadow-[0_0_24px_rgba(37,99,235,0.12)]"
                        : "border-ink-700 bg-ink-950/40 hover:border-ink-500",
                    ].join(" ")}
                    aria-pressed={active}
                  >
                    <span className="block font-display text-sm text-ink-50">
                      {opt.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-ink-400">
                      {opt.hint}
                    </span>
                  </button>
                );
              })}
            </div>

            {form.mode === "portfolio" ? (
              <p className="rounded-xl border border-meta/25 bg-meta/5 px-4 py-3 text-sm text-ink-200">
                Upload up to {MAX_CREATIVE_IMAGES} creatives. I cluster
                near-duplicates into one retrieval ticket and score Format ×
                Persona × Environment × Benefit.
                {creativeCount > 0
                  ? ` ${creativeCount} creative${creativeCount === 1 ? "" : "s"} attached.`
                  : ""}
              </p>
            ) : null}

            <div className="grid gap-6 lg:grid-cols-2">
              <ImageDropzone
                kind="creative"
                label="Creative"
                hint={
                  form.mode === "portfolio"
                    ? "Distinct concepts preferred — crops/CTA swaps collapse to one ticket"
                    : "Ad images or video thumbnails for retrieval & quality scoring"
                }
                images={form.images}
                onAdd={addImages}
                onRemove={removeImage}
                maxCount={
                  form.mode === "portfolio" ? MAX_CREATIVE_IMAGES : 3
                }
                maxTotal={MAX_IMAGES}
              />
              <ImageDropzone
                kind="screenshot"
                label="Ads Manager screenshot"
                hint="Campaign, ad set, or results screens — I'll read the settings"
                images={form.images}
                onAdd={addImages}
                onRemove={removeImage}
                maxCount={MAX_SCREENSHOT_IMAGES}
                maxTotal={MAX_IMAGES}
              />
            </div>

            {form.mode === "portfolio" ? (
              <Field
                label="Portfolio notes"
                htmlFor={`${baseId}-portfolio-notes`}
                hint="Optional: describe each creative (persona, format, benefit) if images alone aren't enough"
              >
                <textarea
                  id={`${baseId}-portfolio-notes`}
                  rows={4}
                  className="input-field resize-y"
                  placeholder={"Ad A: UGC kitchen, sleep benefit…\nAd B: static before/after, athletes…"}
                  value={form.setup.portfolioNotes}
                  onChange={(e) => setSetup("portfolioNotes", e.target.value)}
                />
              </Field>
            ) : null}
          </div>
        ) : null}

        {step === "copy" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Primary text" htmlFor={`${baseId}-primary`}>
              <textarea
                id={`${baseId}-primary`}
                rows={7}
                className="input-field resize-y"
                placeholder="Paste primary text…"
                value={form.copy.primaryText}
                onChange={(e) => setCopy("primaryText", e.target.value)}
              />
            </Field>
            <div className="space-y-4">
              <Field label="Headline" htmlFor={`${baseId}-headline`}>
                <input
                  id={`${baseId}-headline`}
                  className="input-field"
                  value={form.copy.headline}
                  onChange={(e) => setCopy("headline", e.target.value)}
                  placeholder="Headline"
                />
              </Field>
              <Field label="Description" htmlFor={`${baseId}-description`}>
                <input
                  id={`${baseId}-description`}
                  className="input-field"
                  value={form.copy.description}
                  onChange={(e) => setCopy("description", e.target.value)}
                  placeholder="Link description"
                />
              </Field>
              <Field label="CTA" htmlFor={`${baseId}-cta`}>
                <input
                  id={`${baseId}-cta`}
                  className="input-field"
                  value={form.copy.cta}
                  onChange={(e) => setCopy("cta", e.target.value)}
                  placeholder="Learn more / Shop now / WhatsApp…"
                />
              </Field>
            </div>
          </div>
        ) : null}

        {step === "setup" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Objective" htmlFor={`${baseId}-objective`}>
              <input
                id={`${baseId}-objective`}
                className="input-field"
                value={form.setup.objective}
                onChange={(e) => setSetup("objective", e.target.value)}
                placeholder="Sales / Leads / Traffic…"
              />
            </Field>
            <Field
              label="Conversion location"
              htmlFor={`${baseId}-location`}
            >
              <input
                id={`${baseId}-location`}
                className="input-field"
                value={form.setup.conversionLocation}
                onChange={(e) =>
                  setSetup("conversionLocation", e.target.value)
                }
                placeholder="Website / WhatsApp / Instant form…"
              />
            </Field>
            <Field label="Targeting mode" htmlFor={`${baseId}-targeting-mode`}>
              <select
                id={`${baseId}-targeting-mode`}
                className="input-field"
                value={form.setup.targetingMode}
                onChange={(e) => setSetup("targetingMode", e.target.value)}
              >
                <option value="">Select…</option>
                <option value="broad">Broad / Advantage+ Audience</option>
                <option value="advantage_plus">Advantage+</option>
                <option value="interest">Interest stack</option>
                <option value="lal">Lookalike / LAL</option>
                <option value="unknown">Unknown</option>
              </select>
            </Field>
            <Field label="Geo / age" htmlFor={`${baseId}-geo`}>
              <input
                id={`${baseId}-geo`}
                className="input-field"
                value={form.setup.geo}
                onChange={(e) => setSetup("geo", e.target.value)}
                placeholder="MY, 25–54…"
              />
            </Field>
            <Field label="Budget" htmlFor={`${baseId}-budget`}>
              <input
                id={`${baseId}-budget`}
                className="input-field"
                value={form.setup.budget}
                onChange={(e) => setSetup("budget", e.target.value)}
                placeholder="RM100/day CBO…"
              />
            </Field>
            <Field label="Ads in ad set" htmlFor={`${baseId}-ads`}>
              <input
                id={`${baseId}-ads`}
                className="input-field"
                value={form.setup.adsInAdSet}
                onChange={(e) => setSetup("adsInAdSet", e.target.value)}
                placeholder="e.g. 4"
              />
            </Field>
            <Field label="Placements" htmlFor={`${baseId}-placements`}>
              <input
                id={`${baseId}-placements`}
                className="input-field"
                value={form.setup.placements}
                onChange={(e) => setSetup("placements", e.target.value)}
                placeholder="Advantage+ / Feed only…"
              />
            </Field>
            <Field label="Campaign type" htmlFor={`${baseId}-campaign`}>
              <input
                id={`${baseId}-campaign`}
                className="input-field"
                value={form.setup.campaignType}
                onChange={(e) => setSetup("campaignType", e.target.value)}
                placeholder="ASC / Manual / ABO…"
              />
            </Field>
            <Field
              label="Targeting details"
              htmlFor={`${baseId}-targeting`}
              hint="Interests, exclusions, LAL %…"
            >
              <input
                id={`${baseId}-targeting`}
                className="input-field"
                value={form.setup.targeting}
                onChange={(e) => setSetup("targeting", e.target.value)}
                placeholder="Interests, exclusions, LAL %…"
              />
            </Field>
          </div>
        ) : null}

        {step === "metrics" ? (
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="font-display text-sm tracking-wide text-ink-100 uppercase">
                Signal hygiene & Advantage+
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Pixel / CAPI" htmlFor={`${baseId}-pixel`}>
                  <select
                    id={`${baseId}-pixel`}
                    className="input-field"
                    value={form.signals.pixelCapi}
                    onChange={(e) => setSignals("pixelCapi", e.target.value)}
                  >
                    <option value="">Select…</option>
                    <option value="pixel_capi">Pixel + CAPI</option>
                    <option value="pixel_only">Pixel only</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </Field>
                <Field
                  label="EMQ score"
                  htmlFor={`${baseId}-emq`}
                  hint="Event Match Quality 0–10 if known"
                >
                  <input
                    id={`${baseId}-emq`}
                    className="input-field"
                    value={form.signals.emq}
                    onChange={(e) => setSignals("emq", e.target.value)}
                    placeholder="e.g. 7.2"
                  />
                </Field>
                <Field
                  label="Value optimization"
                  htmlFor={`${baseId}-value-opt`}
                >
                  <select
                    id={`${baseId}-value-opt`}
                    className="input-field"
                    value={form.signals.valueOptimization}
                    onChange={(e) =>
                      setSignals("valueOptimization", e.target.value)
                    }
                  >
                    <option value="">Select…</option>
                    <option value="on">On</option>
                    <option value="off">Off</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </Field>
                <Field
                  label="Advantage+ campaign"
                  htmlFor={`${baseId}-asc`}
                  hint="Full Advantage+ sales/ASC vs manual"
                >
                  <select
                    id={`${baseId}-asc`}
                    className="input-field"
                    value={form.signals.advantagePlusCampaign}
                    onChange={(e) =>
                      setSignals("advantagePlusCampaign", e.target.value)
                    }
                  >
                    <option value="">Select…</option>
                    <option value="yes">Yes — full Advantage+</option>
                    <option value="partial">Partial (audience/placements)</option>
                    <option value="no">No — manual cages</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </Field>
                <Field
                  label="Value rules"
                  htmlFor={`${baseId}-value-rules`}
                  hint="New customer / high AOV weights…"
                >
                  <input
                    id={`${baseId}-value-rules`}
                    className="input-field"
                    value={form.signals.valueRules}
                    onChange={(e) => setSignals("valueRules", e.target.value)}
                    placeholder="e.g. new customers 1.5x"
                  />
                </Field>
                <Field
                  label="Landing / CX notes"
                  htmlFor={`${baseId}-cx`}
                  hint="Checkout friction, shipping, misleading claims…"
                >
                  <input
                    id={`${baseId}-cx`}
                    className="input-field"
                    value={form.signals.landingCx}
                    onChange={(e) => setSignals("landingCx", e.target.value)}
                    placeholder="Slow checkout, 7-day shipping…"
                  />
                </Field>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-accent/25 bg-accent/5 px-4 py-3 text-sm text-ink-200">
                Live metrics optional — leave blank and performance stays{" "}
                <span className="font-medium text-accent-bright">Unknown</span>.
                I will not invent ROAS success.
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {(
                  [
                    ["spend", "Spend"],
                    ["ctr", "CTR"],
                    ["cpc", "CPC"],
                    ["cpa", "CPA / cost per result"],
                    ["frequency", "Frequency"],
                    ["learningStatus", "Learning status"],
                    ["qualityRanking", "Quality rankings"],
                    ["notes", "Notes"],
                  ] as const
                ).map(([key, label]) => (
                  <Field key={key} label={label} htmlFor={`${baseId}-${key}`}>
                    <input
                      id={`${baseId}-${key}`}
                      className="input-field"
                      value={form.metrics[key]}
                      onChange={(e) => setMetrics(key, e.target.value)}
                      placeholder={
                        key === "notes" ? "Funnel notes…" : undefined
                      }
                    />
                  </Field>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 border-t border-ink-700/80 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-md text-sm text-ink-400">
          {step === "metrics"
            ? "Ready when you are — I score retrieval, auction fit, and learning density."
            : "One focused step at a time. Jump ahead anytime via the step tabs."}
        </p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={goBack}
            disabled={stepIndex === 0 || loading}
            className="btn-ghost"
          >
            <IconArrowLeft className="h-4 w-4" aria-hidden />
            Back
          </button>
          {stepIndex < STEPS.length - 1 ? (
            <button type="button" onClick={goNext} className="btn-primary">
              Continue
              <IconArrowRight className="h-4 w-4" aria-hidden />
            </button>
          ) : (
            <button
              type="button"
              onClick={onAnalyze}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <>
                  <IconLoader
                    className="h-4 w-4 animate-spin"
                    aria-hidden
                  />
                  Analyzing…
                </>
              ) : (
                <>
                  <IconSpark className="h-4 w-4" aria-hidden />
                  Analyze as Andromeda
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          {error}
        </p>
      ) : null}
    </section>
  );
}
