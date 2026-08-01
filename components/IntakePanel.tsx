"use client";

import { ImageDropzone } from "@/components/ImageDropzone";
import type { ClientImage, IntakeFormState } from "@/lib/types";

type Props = {
  form: IntakeFormState;
  onChange: (next: IntakeFormState) => void;
  onAnalyze: () => void;
  loading: boolean;
  error: string | null;
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs tracking-wide text-ink-400 uppercase">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full border border-ink-700 bg-ink-950/60 px-3 py-2.5 text-sm text-ink-50 outline-none transition placeholder:text-ink-500 focus:border-meta";

export function IntakePanel({
  form,
  onChange,
  onAnalyze,
  loading,
  error,
}: Props) {
  const setCopy = (key: keyof IntakeFormState["copy"], value: string) =>
    onChange({ ...form, copy: { ...form.copy, [key]: value } });
  const setSetup = (key: keyof IntakeFormState["setup"], value: string) =>
    onChange({ ...form, setup: { ...form.setup, [key]: value } });
  const setMetrics = (key: keyof IntakeFormState["metrics"], value: string) =>
    onChange({ ...form, metrics: { ...form.metrics, [key]: value } });

  const addImages = (images: ClientImage[]) =>
    onChange({
      ...form,
      images: [...form.images, ...images].slice(0, 3),
    });

  const removeImage = (id: string) =>
    onChange({
      ...form,
      images: form.images.filter((img) => img.id !== id),
    });

  return (
    <section className="space-y-10" aria-label="Ad intake">
      <div className="grid gap-8 lg:grid-cols-2">
        <ImageDropzone
          kind="creative"
          label="Creative"
          hint="Upload ad images or video thumbnails for retrieval & quality scoring"
          images={form.images}
          onAdd={addImages}
          onRemove={removeImage}
          maxCount={3}
        />
        <ImageDropzone
          kind="screenshot"
          label="Ads Manager screenshot"
          hint="Drop campaign, ad set, or results screens — I'll read the settings"
          images={form.images}
          onAdd={addImages}
          onRemove={removeImage}
          maxCount={3}
        />
      </div>

      <div className="space-y-4">
        <h3 className="font-display text-sm tracking-wide text-ink-100 uppercase">
          Ad copy
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Primary text">
            <textarea
              rows={5}
              className={inputClass}
              placeholder="Paste primary text…"
              value={form.copy.primaryText}
              onChange={(e) => setCopy("primaryText", e.target.value)}
            />
          </Field>
          <div className="space-y-4">
            <Field label="Headline">
              <input
                className={inputClass}
                value={form.copy.headline}
                onChange={(e) => setCopy("headline", e.target.value)}
                placeholder="Headline"
              />
            </Field>
            <Field label="Description">
              <input
                className={inputClass}
                value={form.copy.description}
                onChange={(e) => setCopy("description", e.target.value)}
                placeholder="Link description"
              />
            </Field>
            <Field label="CTA">
              <input
                className={inputClass}
                value={form.copy.cta}
                onChange={(e) => setCopy("cta", e.target.value)}
                placeholder="Learn more / Shop now / WhatsApp…"
              />
            </Field>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-display text-sm tracking-wide text-ink-100 uppercase">
          Setup
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Objective">
            <input
              className={inputClass}
              value={form.setup.objective}
              onChange={(e) => setSetup("objective", e.target.value)}
              placeholder="Sales / Leads / Traffic…"
            />
          </Field>
          <Field label="Conversion location">
            <input
              className={inputClass}
              value={form.setup.conversionLocation}
              onChange={(e) => setSetup("conversionLocation", e.target.value)}
              placeholder="Website / WhatsApp / Instant form…"
            />
          </Field>
          <Field label="Targeting mode">
            <select
              className={inputClass}
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
          <Field label="Geo / age">
            <input
              className={inputClass}
              value={form.setup.geo}
              onChange={(e) => setSetup("geo", e.target.value)}
              placeholder="MY, 25–54…"
            />
          </Field>
          <Field label="Budget">
            <input
              className={inputClass}
              value={form.setup.budget}
              onChange={(e) => setSetup("budget", e.target.value)}
              placeholder="RM100/day CBO…"
            />
          </Field>
          <Field label="Ads in ad set">
            <input
              className={inputClass}
              value={form.setup.adsInAdSet}
              onChange={(e) => setSetup("adsInAdSet", e.target.value)}
              placeholder="e.g. 4"
            />
          </Field>
          <Field label="Placements">
            <input
              className={inputClass}
              value={form.setup.placements}
              onChange={(e) => setSetup("placements", e.target.value)}
              placeholder="Advantage+ / Feed only…"
            />
          </Field>
          <Field label="Campaign type">
            <input
              className={inputClass}
              value={form.setup.campaignType}
              onChange={(e) => setSetup("campaignType", e.target.value)}
              placeholder="ASC / Manual / ABO…"
            />
          </Field>
          <Field label="Targeting details">
            <input
              className={inputClass}
              value={form.setup.targeting}
              onChange={(e) => setSetup("targeting", e.target.value)}
              placeholder="Interests, exclusions, LAL %…"
            />
          </Field>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-display text-sm tracking-wide text-ink-100 uppercase">
            Live metrics
          </h3>
          <p className="text-xs text-ink-500">
            Optional — leave blank and live performance stays Unknown
          </p>
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
            ] as const
          ).map(([key, label]) => (
            <Field key={key} label={label}>
              <input
                className={inputClass}
                value={form.metrics[key]}
                onChange={(e) => setMetrics(key, e.target.value)}
              />
            </Field>
          ))}
          <Field label="Notes">
            <input
              className={inputClass}
              value={form.metrics.notes}
              onChange={(e) => setMetrics("notes", e.target.value)}
              placeholder="Funnel notes, EMQ, Pixel…"
            />
          </Field>
        </div>
      </div>

      <div className="flex flex-col items-stretch gap-3 border-t border-ink-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-sm text-ink-400">
          I score retrieval tickets, auction fit, and learning density — then
          prescribe fixes that maximize conversion.
        </p>
        <button
          type="button"
          onClick={onAnalyze}
          disabled={loading}
          className="inline-flex min-w-48 items-center justify-center bg-meta px-6 py-3.5 font-display text-sm tracking-wide text-white uppercase transition hover:bg-meta-bright disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Analyzing…" : "Analyze as Andromeda"}
        </button>
      </div>

      {error ? (
        <p className="border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      ) : null}
    </section>
  );
}
