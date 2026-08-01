import { z } from "zod";

export const letterGradeSchema = z.enum(["A", "B", "C", "D", "F"]);

export const analysisResultSchema = z.object({
  verdict: z.enum(["PASS", "AT_RISK", "FAIL", "UNKNOWN"]),
  bottomLine: z
    .string()
    .describe("One-sentence Andromeda bottom line in first person"),
  eligibility: z.object({
    summary: z.string(),
    blockers: z.array(z.string()),
  }),
  retrieval: z.object({
    semanticNode: z
      .string()
      .describe("Intent family: product + pain + offer type"),
    ticketCount: z
      .number()
      .int()
      .min(0)
      .describe("Count of true distinct concepts / retrieval tickets"),
    ticketRationale: z.string(),
    cageCheck: z.string(),
    congruence: z.string(),
    grade: z.enum(["PASS", "WEAK", "FAIL"]),
  }),
  ranking: z.object({
    earFit: z.string(),
    quality: z.string(),
    formulaRisk: z.string(),
  }),
  learning: z.object({
    summary: z.string(),
    budgetGuidance: z.string(),
  }),
  scorecard: z.object({
    setupAlignment: letterGradeSchema,
    setupAlignmentNote: z.string(),
    creativeDiversity: letterGradeSchema,
    creativeDiversityNote: z.string(),
    objectiveOfferFit: letterGradeSchema,
    objectiveOfferFitNote: z.string(),
    livePerformance: z.enum([
      "Working",
      "NotWorking",
      "Learning",
      "Unknown",
    ]),
    livePerformanceNote: z.string(),
  }),
  whatWentWell: z
    .array(z.string())
    .min(1)
    .max(6)
    .describe("Concrete strengths that help retrieval, EAR, quality, or learning"),
  whatWentWrong: z
    .array(z.string())
    .min(1)
    .max(8)
    .describe("Concrete failures or risks hurting conversion"),
  fixes: z
    .array(
      z.object({
        priority: z.number().int().min(1),
        action: z.string(),
        why: z
          .string()
          .describe(
            "Must explain impact on retrieval tickets, EAR, ad quality, or learning density",
          ),
      }),
    )
    .min(1)
    .max(8),
  missingInputs: z
    .array(z.string())
    .describe("What would sharpen the diagnosis; empty if nothing missing"),
});

export type AnalysisResult = z.infer<typeof analysisResultSchema>;

const imageInputSchema = z.object({
  dataUrl: z.string().regex(/^data:image\/(png|jpeg|jpg|webp|gif);base64,/i),
  kind: z.enum(["creative", "screenshot"]),
  name: z.string().optional(),
});

const copySchema = z
  .object({
    primaryText: z.string().max(8000).optional().default(""),
    headline: z.string().max(500).optional().default(""),
    description: z.string().max(1000).optional().default(""),
    cta: z.string().max(120).optional().default(""),
  })
  .default({
    primaryText: "",
    headline: "",
    description: "",
    cta: "",
  });

const setupSchema = z
  .object({
    objective: z.string().max(200).optional().default(""),
    conversionLocation: z.string().max(200).optional().default(""),
    targeting: z.string().max(1000).optional().default(""),
    targetingMode: z
      .enum(["broad", "interest", "lal", "advantage_plus", "unknown", ""])
      .optional()
      .default(""),
    geo: z.string().max(300).optional().default(""),
    budget: z.string().max(200).optional().default(""),
    placements: z.string().max(300).optional().default(""),
    adsInAdSet: z.string().max(50).optional().default(""),
    campaignType: z.string().max(200).optional().default(""),
  })
  .default({
    objective: "",
    conversionLocation: "",
    targeting: "",
    targetingMode: "",
    geo: "",
    budget: "",
    placements: "",
    adsInAdSet: "",
    campaignType: "",
  });

const metricsSchema = z
  .object({
    spend: z.string().max(100).optional().default(""),
    ctr: z.string().max(100).optional().default(""),
    cpc: z.string().max(100).optional().default(""),
    cpa: z.string().max(100).optional().default(""),
    frequency: z.string().max(100).optional().default(""),
    learningStatus: z.string().max(200).optional().default(""),
    qualityRanking: z.string().max(200).optional().default(""),
    notes: z.string().max(2000).optional().default(""),
  })
  .default({
    spend: "",
    ctr: "",
    cpc: "",
    cpa: "",
    frequency: "",
    learningStatus: "",
    qualityRanking: "",
    notes: "",
  });

export const analyzeRequestSchema = z.object({
  images: z.array(imageInputSchema).max(3).default([]),
  copy: copySchema,
  setup: setupSchema,
  metrics: metricsSchema,
});

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;

export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
