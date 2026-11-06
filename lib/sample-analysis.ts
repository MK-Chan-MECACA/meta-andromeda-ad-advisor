// Static sample shown on the public landing page. Illustrative only: a
// fictional brand, written to look like a real Andromeda result. No AI call.
import type { AnalysisResult } from "./analysis-schema.ts";

export const sampleAd = {
  brand: "Embun Skin (fictional Malaysian skincare brand)",
  creative: "Single 4:5 image: hand holding the sunscreen tube, beach backdrop",
  primaryText:
    "Panas terik? Our SPF50 PA++++ gel sunscreen is light, no white cast and sweat-proof for Malaysian weather. 20% off this week + free shipping West Malaysia.",
  headline: "SPF50 Gel Sunscreen — 20% Off",
  cta: "Shop Now",
  objective: "Sales (Purchase) — website",
  targeting: "Women 18–40, Malaysia, interests: skincare, Watsons, Guardian",
  budget: "RM 50/day, 1 ad in the ad set",
  metrics: "Spend RM 420 · CTR 0.9% · CPA RM 68 · Frequency 2.6 · Learning limited",
};

export const sampleAnalysis: AnalysisResult = {
  verdict: "AT_RISK",
  bottomLine:
    "I can retrieve this ad for sun-care shoppers, but one creative on RM 50/day with a narrow interest stack is starving learning, so CPA will stay high until you widen and diversify.",
  eligibility: {
    summary:
      "No policy blockers. Sunscreen claims stay within cosmetic language and the landing page matches the offer.",
    blockers: [],
  },
  retrieval: {
    semanticNode:
      "Daily sunscreen for hot, humid climate — comfort (no white cast, sweat-proof) + limited-time discount",
    ticketCount: 1,
    ticketRationale:
      "Only one concept is live: product-in-hand on a beach. Copy variations would not create new tickets.",
    cageCheck:
      "Interest stack (skincare, Watsons, Guardian) narrows the pool well below what the creative could reach.",
    congruence:
      "Strong: image, headline and landing page all show the same SPF50 gel tube and the same 20% offer.",
    grade: "WEAK",
  },
  ranking: {
    earFit:
      "Beach imagery signals holiday use, while the copy sells everyday commuting comfort; estimated action rate is diluted for office-going buyers.",
    quality:
      "Clear product shot and readable text overlay; no engagement-bait or low-quality signals.",
    formulaRisk:
      "Discount-led hook may attract one-time bargain buyers; watch repeat purchase rate.",
  },
  learning: {
    summary:
      "About 6 purchases in 7 days, well short of the ~50 per week needed to exit learning.",
    budgetGuidance:
      "Consolidate into one broad ad set at RM 120–150/day, or optimise for Add to Cart until purchase volume can support learning.",
  },
  scorecard: {
    setupAlignment: "C",
    setupAlignmentNote:
      "Purchase objective is right, but interest targeting fights Andromeda's broad retrieval.",
    creativeDiversity: "D",
    creativeDiversityNote: "One concept, one format. Andromeda has nothing to match against different buyers.",
    objectiveOfferFit: "B",
    objectiveOfferFitNote: "A concrete 20% offer suits a purchase objective at this price point.",
    livePerformance: "Learning",
    livePerformanceNote: "Learning limited: CPA RM 68 against a RM 39 average order value.",
  },
  whatWentWell: [
    "Offer is concrete and time-bound (20% off this week + free shipping).",
    "Local language hook ('Panas terik?') fits Malaysian buyers and humid-weather pain.",
    "Creative, headline and landing page are fully congruent.",
  ],
  whatWentWrong: [
    "Only one creative concept, so Andromeda has a single retrieval ticket.",
    "Interest stack narrows delivery and works against broad retrieval.",
    "Budget is too low for purchase-optimised learning; ad set is stuck in learning limited.",
    "Beach visual mismatches the everyday-commute benefit in the copy.",
  ],
  fixes: [
    {
      priority: 1,
      action:
        "Add 3–4 genuinely different concepts: commuter selfie video, texture close-up, creator UGC review, before/after white-cast comparison.",
      why: "Each distinct concept is a new retrieval ticket, letting Andromeda match the ad to different buyer intents.",
    },
    {
      priority: 2,
      action: "Switch to broad targeting (women 18–45, Malaysia) or Advantage+ audience.",
      why: "Removes the cage so retrieval can find buyers beyond the interest stack, which densifies learning.",
    },
    {
      priority: 3,
      action:
        "Consolidate budget to RM 120–150/day in one ad set, or optimise for Add to Cart until purchases reach ~50/week.",
      why: "More conversion events per week lets the system exit learning and stabilise CPA.",
    },
    {
      priority: 4,
      action: "Reshoot the hero image in an everyday setting (LRT, office, outdoor lunch).",
      why: "Aligning visual and copy raises estimated action rate (EAR) for the core buyer.",
    },
  ],
  missingInputs: [
    "Landing page conversion rate",
    "Average order value trend over the last 30 days",
  ],
};
