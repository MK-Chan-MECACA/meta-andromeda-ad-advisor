import type { AnalysisResult } from "@/lib/analysis-schema";

export type ImageKind = "creative" | "screenshot";

export type ClientImage = {
  id: string;
  kind: ImageKind;
  name: string;
  dataUrl: string;
};

export type IntakeFormState = {
  images: ClientImage[];
  copy: {
    primaryText: string;
    headline: string;
    description: string;
    cta: string;
  };
  setup: {
    objective: string;
    conversionLocation: string;
    targeting: string;
    targetingMode: string;
    geo: string;
    budget: string;
    placements: string;
    adsInAdSet: string;
    campaignType: string;
  };
  metrics: {
    spend: string;
    ctr: string;
    cpc: string;
    cpa: string;
    frequency: string;
    learningStatus: string;
    qualityRanking: string;
    notes: string;
  };
};

export const emptyIntakeForm = (): IntakeFormState => ({
  images: [],
  copy: {
    primaryText: "",
    headline: "",
    description: "",
    cta: "",
  },
  setup: {
    objective: "",
    conversionLocation: "",
    targeting: "",
    targetingMode: "",
    geo: "",
    budget: "",
    placements: "",
    adsInAdSet: "",
    campaignType: "",
  },
  metrics: {
    spend: "",
    ctr: "",
    cpc: "",
    cpa: "",
    frequency: "",
    learningStatus: "",
    qualityRanking: "",
    notes: "",
  },
});

export type AnalyzeResponse =
  | { analysis: AnalysisResult; id: string }
  | { error: string; details?: unknown };
