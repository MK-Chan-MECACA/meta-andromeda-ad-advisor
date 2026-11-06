import Link from "next/link";
import { ResultsDashboard } from "@/components/ResultsDashboard";
import { IconSpark } from "@/components/Icons";
import { PLANS } from "@/lib/entitlements";
import { sampleAd, sampleAnalysis } from "@/lib/sample-analysis";

const primaryCta =
  "inline-flex rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-ink-950 transition hover:bg-accent-bright";
const secondaryCta =
  "inline-flex rounded-xl border border-ink-600 px-5 py-2.5 text-sm text-ink-100 transition hover:border-ink-400 hover:text-ink-50";

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

export default function Landing() {
  return (
    <div className="relative flex-1 overflow-x-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(165deg,#060a12_0%,#0b1220_42%,#0a1628_72%,#060a12_100%)]" />
        <div className="animate-blob absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.28),transparent_68%)]" />
        <div className="animate-blob absolute top-[20%] -right-32 h-[360px] w-[360px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(217,119,6,0.12),transparent_70%)] [animation-delay:2s]" />
        <div className="absolute inset-0 opacity-[0.045] [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:72px_72px]" />
      </div>

      <main className="relative mx-auto w-full max-w-6xl px-5 pt-14 pb-24 sm:px-8 sm:pt-20">
        <header className="max-w-3xl animate-rise">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-meta/30 bg-meta/10 px-3 py-1.5 text-xs text-meta-bright">
            <IconSpark className="h-3.5 w-3.5" aria-hidden />
            <span className="font-display tracking-[0.18em] uppercase">
              Meta ad advisor
            </span>
          </div>
          <h1 className="font-display text-5xl leading-[0.95] tracking-tight text-ink-50 sm:text-7xl">
            ANDROMEDA
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-200 sm:text-lg">
            Paste your ad copy, setup and numbers, or upload the creative.
            Andromeda reviews it the way Meta&apos;s delivery system sees it and
            tells you what to fix first.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/sign-up" className={primaryCta}>
              Start free
            </Link>
            <Link href="#sample" className={secondaryCta}>
              See a sample analysis
            </Link>
            <Link href="/dashboard" className={secondaryCta}>
              Sign in
            </Link>
          </div>
        </header>

        <section aria-labelledby="how" className="mt-24 animate-rise-delay">
          <h2 id="how" className="font-display text-2xl text-ink-50 sm:text-3xl">
            How it works
          </h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {steps.map((step, i) => (
              <li key={step.title} className="surface-glass rounded-2xl p-5">
                <p className="font-display text-xs tracking-[0.2em] text-meta-bright uppercase">
                  Step {i + 1}
                </p>
                <h3 className="mt-2 font-display text-lg text-ink-50">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-300">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="sample" aria-labelledby="sample-title" className="mt-24 scroll-mt-8">
          <p className="font-display text-xs tracking-[0.2em] text-accent-bright uppercase">
            Sample analysis
          </p>
          <h2 id="sample-title" className="mt-2 font-display text-2xl text-ink-50 sm:text-3xl">
            A real-format result for a fictional skincare ad
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-ink-300">
            This is a static example. Sign up to run Andromeda on your own ads.
          </p>
          <div className="surface-glass mt-6 rounded-2xl p-5 sm:p-6">
            <h3 className="font-display text-sm tracking-wide text-ink-100 uppercase">
              Ad inputs
            </h3>
            <dl className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-[10rem_1fr]">
              {sampleRows.map(([label, value]) => (
                <div key={label} className="contents">
                  <dt className="text-ink-300">{label}</dt>
                  <dd className="text-ink-100">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="mt-10">
            <ResultsDashboard analysis={sampleAnalysis} />
          </div>
        </section>

        <section aria-labelledby="pricing" className="mt-24">
          <h2 id="pricing" className="font-display text-2xl text-ink-50 sm:text-3xl">
            Pricing
          </h2>
          <p className="mt-2 text-sm text-ink-300">
            Prices in Malaysian ringgit. Pay by card, FPX or GrabPay.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={[
                  "surface-glass flex flex-col rounded-2xl p-6",
                  plan.featured ? "border-meta/60" : "",
                ].join(" ")}
              >
                <h3 className="font-display text-lg text-ink-50">{plan.name}</h3>
                <p className="mt-3">
                  <span className="font-display text-4xl text-ink-50">{plan.price}</span>{" "}
                  <span className="text-sm text-ink-300">{plan.period}</span>
                </p>
                <ul className="mt-5 flex-1 space-y-2 text-sm text-ink-200">
                  <li>{plan.limits.quota} analyses per month</li>
                  <li>
                    {plan.limits.seats} {plan.limits.seats === 1 ? "seat" : "seats"}
                  </li>
                  {plan.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <Link
                  href="/sign-up"
                  className={`mt-6 justify-center ${plan.featured ? primaryCta : secondaryCta}`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="cta" className="surface-glass mt-24 rounded-2xl p-8 text-center">
          <h2 id="cta" className="font-display text-2xl text-ink-50">
            Check your next ad before you spend
          </h2>
          <p className="mt-2 text-sm text-ink-300">
            {PLANS.free.quota} free analyses every month. No card required.
          </p>
          <Link href="/sign-up" className={`mt-6 ${primaryCta}`}>
            Create your free account
          </Link>
        </section>
      </main>
    </div>
  );
}
