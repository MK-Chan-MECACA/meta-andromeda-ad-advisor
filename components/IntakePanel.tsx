"use client";

import { useId, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChartColumn,
  Image as ImageIcon,
  Loader2,
  SlidersHorizontal,
  Sparkles,
  Type,
  CircleAlert,
} from "lucide-react";
import { ImageDropzone } from "@/components/ImageDropzone";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { ClientImage, IntakeFormState } from "@/lib/types";

type Props = {
  form: IntakeFormState;
  onChange: (next: IntakeFormState) => void;
  onAnalyze: () => void;
  loading: boolean;
  error: string | null;
};

const STEPS = [
  { id: "assets", label: "Assets", hint: "Creative and Ads Manager screenshots.", Icon: ImageIcon },
  { id: "copy", label: "Copy", hint: "The text that ships with the ad.", Icon: Type },
  { id: "setup", label: "Setup", hint: "Objective, targeting and budget.", Icon: SlidersHorizontal },
  { id: "metrics", label: "Metrics", hint: "Optional live results.", Icon: ChartColumn },
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
    <div className="flex flex-col gap-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function IntakePanel({ form, onChange, onAnalyze, loading, error }: Props) {
  const id = useId();
  const [step, setStep] = useState<StepId>("assets");
  const stepIndex = STEPS.findIndex((s) => s.id === step);
  const current = STEPS[stepIndex];

  const setCopy = (key: keyof IntakeFormState["copy"], value: string) =>
    onChange({ ...form, copy: { ...form.copy, [key]: value } });
  const setSetup = (key: keyof IntakeFormState["setup"], value: string) =>
    onChange({ ...form, setup: { ...form.setup, [key]: value } });
  const setMetrics = (key: keyof IntakeFormState["metrics"], value: string) =>
    onChange({ ...form, metrics: { ...form.metrics, [key]: value } });

  const addImages = (images: ClientImage[]) =>
    onChange({ ...form, images: [...form.images, ...images].slice(0, 3) });
  const removeImage = (imageId: string) =>
    onChange({ ...form, images: form.images.filter((img) => img.id !== imageId) });

  /** Plain text inputs share one shape; only the setter differs. */
  const text = (
    key: string,
    value: string,
    set: (v: string) => void,
    placeholder?: string,
  ) => (
    <Input
      id={`${id}-${key}`}
      value={value}
      onChange={(e) => set(e.target.value)}
      placeholder={placeholder}
    />
  );

  return (
    <Card>
      <Tabs value={step} onValueChange={(v) => setStep(v as StepId)} className="gap-4">
        <CardHeader>
          <CardTitle>Ad intake</CardTitle>
          <CardDescription>
            Step {stepIndex + 1} of {STEPS.length} · {current.hint}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          <TabsList className="grid w-full grid-cols-4">
            {STEPS.map(({ id: stepId, label, Icon }) => (
              <TabsTrigger key={stepId} value={stepId}>
                <Icon data-icon="inline-start" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="assets" className="grid gap-6 lg:grid-cols-2">
            <ImageDropzone
              kind="creative"
              label="Creative"
              hint="Ad images or video thumbnails for retrieval and quality scoring."
              images={form.images}
              onAdd={addImages}
              onRemove={removeImage}
              maxCount={3}
            />
            <ImageDropzone
              kind="screenshot"
              label="Ads Manager screenshot"
              hint="Campaign, ad set or results screens. I'll read the settings."
              images={form.images}
              onAdd={addImages}
              onRemove={removeImage}
              maxCount={3}
            />
          </TabsContent>

          <TabsContent value="copy" className="grid gap-4 md:grid-cols-2">
            <Field label="Primary text" htmlFor={`${id}-primary`}>
              <Textarea
                id={`${id}-primary`}
                rows={9}
                className="min-h-48"
                placeholder="Paste primary text…"
                value={form.copy.primaryText}
                onChange={(e) => setCopy("primaryText", e.target.value)}
              />
            </Field>
            <div className="flex flex-col gap-4">
              <Field label="Headline" htmlFor={`${id}-headline`}>
                {text("headline", form.copy.headline, (v) => setCopy("headline", v), "Headline")}
              </Field>
              <Field label="Description" htmlFor={`${id}-description`}>
                {text("description", form.copy.description, (v) => setCopy("description", v), "Link description")}
              </Field>
              <Field label="CTA" htmlFor={`${id}-cta`}>
                {text("cta", form.copy.cta, (v) => setCopy("cta", v), "Learn more / Shop now / WhatsApp…")}
              </Field>
            </div>
          </TabsContent>

          <TabsContent value="setup" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Objective" htmlFor={`${id}-objective`}>
              {text("objective", form.setup.objective, (v) => setSetup("objective", v), "Sales / Leads / Traffic…")}
            </Field>
            <Field label="Conversion location" htmlFor={`${id}-location`}>
              {text("location", form.setup.conversionLocation, (v) => setSetup("conversionLocation", v), "Website / WhatsApp / Instant form…")}
            </Field>
            <Field label="Targeting mode" htmlFor={`${id}-targeting-mode`}>
              <Select
                value={form.setup.targetingMode || undefined}
                onValueChange={(v) => setSetup("targetingMode", v)}
              >
                <SelectTrigger id={`${id}-targeting-mode`} className="w-full">
                  <SelectValue placeholder="Select…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="broad">Broad / Advantage+ Audience</SelectItem>
                  <SelectItem value="advantage_plus">Advantage+</SelectItem>
                  <SelectItem value="interest">Interest stack</SelectItem>
                  <SelectItem value="lal">Lookalike / LAL</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Geo / age" htmlFor={`${id}-geo`}>
              {text("geo", form.setup.geo, (v) => setSetup("geo", v), "MY, 25–54…")}
            </Field>
            <Field label="Budget" htmlFor={`${id}-budget`}>
              {text("budget", form.setup.budget, (v) => setSetup("budget", v), "RM100/day CBO…")}
            </Field>
            <Field label="Ads in ad set" htmlFor={`${id}-ads`}>
              {text("ads", form.setup.adsInAdSet, (v) => setSetup("adsInAdSet", v), "e.g. 4")}
            </Field>
            <Field label="Placements" htmlFor={`${id}-placements`}>
              {text("placements", form.setup.placements, (v) => setSetup("placements", v), "Advantage+ / Feed only…")}
            </Field>
            <Field label="Campaign type" htmlFor={`${id}-campaign`}>
              {text("campaign", form.setup.campaignType, (v) => setSetup("campaignType", v), "ASC / Manual / ABO…")}
            </Field>
            <Field label="Targeting details" htmlFor={`${id}-targeting`}>
              {text("targeting", form.setup.targeting, (v) => setSetup("targeting", v), "Interests, exclusions, LAL %…")}
            </Field>
          </TabsContent>

          <TabsContent value="metrics" className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Leave blank and live performance stays <span className="text-foreground">Unknown</span>.
              Nothing is guessed.
            </p>
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
                <Field key={key} label={label} htmlFor={`${id}-${key}`}>
                  {text(
                    key,
                    form.metrics[key],
                    (v) => setMetrics(key, v),
                    key === "notes" ? "Funnel notes, EMQ, Pixel…" : undefined,
                  )}
                </Field>
              ))}
            </div>
          </TabsContent>

          {error ? (
            <Alert variant="destructive">
              <CircleAlert />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
        </CardContent>

        <CardFooter className="justify-between gap-2 border-t">
          <Button
            variant="outline"
            onClick={() => setStep(STEPS[stepIndex - 1].id)}
            disabled={stepIndex === 0 || loading}
          >
            <ArrowLeft data-icon="inline-start" />
            Back
          </Button>
          {stepIndex < STEPS.length - 1 ? (
            <Button variant="secondary" onClick={() => setStep(STEPS[stepIndex + 1].id)}>
              Continue
              <ArrowRight data-icon="inline-end" />
            </Button>
          ) : (
            <Button onClick={onAnalyze} disabled={loading}>
              {loading ? (
                <Loader2 data-icon="inline-start" className="animate-spin" />
              ) : (
                <Sparkles data-icon="inline-start" />
              )}
              {loading ? "Analyzing…" : "Run analysis"}
            </Button>
          )}
        </CardFooter>
      </Tabs>
    </Card>
  );
}
