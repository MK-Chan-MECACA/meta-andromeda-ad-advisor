import Link from "next/link";
import { ResultsDashboard } from "@/components/ResultsDashboard";
import { Hero } from "@/components/landing/Hero";
import { PLANS } from "@/lib/entitlements";
import { cn } from "@/lib/utils";
import { sampleAd, sampleAnalysis } from "@/lib/sample-analysis";

const steps = [
  {
    title: "Retrieval",
    body: "Is your ad eligible, and how many distinct concepts (retrieval tickets) does it give Meta to match against buyers?",
  },
  {
    title: "Ranking",
    body: "Does the creative raise estimated action rate and quality, or does a mismatch between visual, copy and offer drag it down?",
  },
  {
    title: "Learning",
    body: "Does your budget and structure produce enough conversions for the system to exit learning and stabilise cost?",
  },
];

const sampleRows: [string, string][] = [
  ["Brand", sampleAd.brand],
  ["Creative", sampleAd.creative],
  ["Primary text", sampleAd.primaryText],
  ["Headline / CTA", `${sampleAd.headline} · ${sampleAd.cta}`],
  ["Objective", sampleAd.objective],
  ["Targeting", sampleAd.targeting],
  ["Budget", sampleAd.budget],
  ["Live metrics", sampleAd.metrics],
];

const plans = [
  {
    name: "Free",
    price: "RM 0",
    period: "forever",
    limits: PLANS.free,
    features: ["Capable, cost-efficient model", "Saved analysis history"],
    cta: "Start free",
  },
  {
    name: "Pro",
    price: "RM 99",
    period: "per month, or RM 990/year",
    limits: PLANS.pro,
    features: [
      "Our best available model",
      "Saved, shared workspace history",
      "Meta ad import (invite-only beta)",
    ],
    cta: "Start with Free, upgrade anytime",
    featured: true,
  },
];

const PAD = "px-5 sm:px-8 md:px-12 lg:px-16";
const linkCls =
  "inline-block text-xs font-light tracking-wide text-white transition-opacity duration-300 hover:opacity-70 sm:text-sm";
const pillCls =
  "inline-flex h-10 items-center justify-center rounded-full border border-white/30 px-6 text-sm font-light tracking-wide text-white transition-colors duration-300 hover:border-white/60";

/** Hero-style section opener: thin rule, index + label, light display sentence. */
function SectionHead({
  id,
  index,
  label,
  before,
  em,
  after,
}: {
  id: string;
  index: string;
  label: string;
  before: string;
  em: string;
  after: string;
}) {
  return (
    <>
      <div className="flex items-center justify-between border-t border-white/10 pt-4 text-[10px] font-light text-white/50 sm:text-xs">
        <span>{index}</span>
        <span>{label}</span>
      </div>
      <h2
        id={id}
        className="mt-10 max-w-3xl text-2xl leading-[1.45] font-light tracking-tight text-white sm:mt-14 sm:text-3xl md:text-[2.1rem]"
      >
        {before}
        <span className="underline decoration-white/60 underline-offset-4">{em}</span>
        {after}
      </h2>
    </>
  );
}

export default function Landing() {
  return (
    <div className="flex flex-1 flex-col bg-black font-sans text-white">
      <Hero />

      <main className={`flex flex-col gap-32 py-24 sm:gap-40 sm:py-32 ${PAD}`}>
        <section id="how" aria-labelledby="how-title" className="scroll-mt-8">
          <SectionHead
            id="how-title"
            index="01"
            label="How it works"
            before="Three checks, in "
            em="the order Meta runs them"
            after=" — from eligibility and retrieval, through the auction, to learning."
          />
          <ol className="mt-14 grid sm:mt-20 md:grid-cols-3 md:divide-x md:divide-white/10">
            {steps.map((step, i) => (
              <li
                key={step.title}
                className="flex flex-col gap-4 border-t border-white/10 py-8 md:border-t-0 md:px-8 md:py-2 md:first:pl-0"
              >
                <span className="text-[10px] font-light text-white/50 sm:text-xs">0{i + 1}</span>
                <h3 className="text-xl font-light tracking-tight sm:text-2xl">{step.title}</h3>
                <p className="max-w-sm text-sm leading-relaxed font-light text-white/50">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section id="sample" aria-labelledby="sample-title" className="scroll-mt-8">
          <SectionHead
            id="sample-title"
            index="02"
            label="Sample analysis"
            before="A real-format result for "
            em="a fictional skincare ad"
            after=" — static example, same output you get on your own ads."
          />

          <dl className="mt-14 grid max-w-4xl text-sm font-light sm:mt-20 sm:grid-cols-[11rem_1fr]">
            {sampleRows.map(([label, value]) => (
              <div key={label} className="contents">
                <dt className="border-t border-white/10 pt-3 pb-1 text-[10px] tracking-wider text-white/40 uppercase sm:py-3 sm:text-xs">
                  {label}
                </dt>
                <dd className="pb-3 leading-relaxed text-white/80 sm:border-t sm:border-white/10 sm:pt-3">
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="editorial mt-14 sm:mt-20">
            <ResultsDashboard analysis={sampleAnalysis} />
          </div>
        </section>

        <section id="pricing" aria-labelledby="pricing-title" className="scroll-mt-8">
          <SectionHead
            id="pricing-title"
            index="03"
            label="Pricing"
            before="Simple monthly plans, "
            em="priced in ringgit"
            after=" — start free, upgrade when the numbers justify it. Pay by card."
          />
          <div className="mt-14 grid sm:mt-20 md:grid-cols-2 md:divide-x md:divide-white/10">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className="flex flex-col border-t border-white/10 py-10 md:border-t-0 md:px-10 md:py-2 md:first:pl-0"
              >
                <div className="flex items-baseline justify-between text-[10px] font-light tracking-wider text-white/50 uppercase sm:text-xs">
                  <span>{plan.name}</span>
                  {plan.featured ? <span>Recommended</span> : null}
                </div>
                <p className="mt-6 text-5xl font-light tracking-tight sm:text-6xl">{plan.price}</p>
                <p className="mt-2 text-sm font-light text-white/50">{plan.period}</p>
                <ul className="mt-8 flex flex-1 flex-col text-sm font-light text-white/80">
                  {[
                    `${plan.limits.quota} analyses per month`,
                    `${plan.limits.seats} ${plan.limits.seats === 1 ? "seat" : "seats"}`,
                    ...plan.features,
                  ].map((f) => (
                    <li key={f} className="border-t border-white/10 py-3">
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/sign-up"
                  className={cn(
                    "mt-8 w-fit",
                    pillCls,
                    plan.featured && "border-white bg-white text-black hover:border-white hover:bg-white/85",
                  )}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="cta-title" className="border-t border-white/10 pt-16 sm:pt-24">
          <h2
            id="cta-title"
            className="max-w-3xl text-3xl leading-[1.3] font-light tracking-tight sm:text-4xl md:text-5xl"
          >
            Check your next ad{" "}
            <span className="underline decoration-white/60 underline-offset-[6px]">before you spend</span>.
          </h2>
          <p className="mt-6 text-sm font-light text-white/50">
            {PLANS.free.quota} free analyses every month. No card required.
          </p>
          <Link href="/sign-up" className={`mt-8 ${linkCls}`}>
            Create your free account—
          </Link>
        </section>
      </main>

      <footer className={`pb-5 sm:pb-8 ${PAD}`}>
        <div className="flex flex-col gap-4 border-t border-white/10 pt-4 text-[10px] font-light tracking-wider text-white/40 uppercase sm:flex-row sm:items-end sm:justify-between sm:text-xs">
          <span>© {new Date().getFullYear()} Andromeda</span>
          <span>Meta ad advisor</span>
        </div>
      </footer>
    </div>
  );
}
