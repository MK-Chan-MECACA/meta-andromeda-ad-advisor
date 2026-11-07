"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { PLANS } from "@/lib/entitlements";

const VIDEO_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_135039_b04d00db-6ee2-4e2a-a7f5-b2dfd3d24fd2.mp4";

const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";

const SLIDES = [
  {
    before: "Diagnosis of ",
    em: "retrieval tickets",
    after:
      " for every ad you upload — how many distinct concepts give Meta's delivery system something to match against buyers.",
    cta: "Start free",
    href: "/sign-up",
  },
  {
    before: "Scoring of ",
    em: "ranking signals",
    after:
      " across creative, copy and offer — where a mismatch drags down estimated action rate before the auction even starts.",
    cta: "See a sample analysis",
    href: "#sample",
  },
  {
    before: "Checks on ",
    em: "learning density",
    after:
      " for budget and structure — enough conversions to exit learning, with fixes ranked in the order to ship them.",
    cta: "View pricing",
    href: "#pricing",
  },
];

const MENU_LINKS = [
  { label: "How it works", href: "#how" },
  { label: "Sample", href: "#sample" },
  { label: "Pricing", href: "#pricing" },
  { label: "Sign in", href: "/dashboard" },
];

function Logo() {
  return (
    <Link
      href="/"
      aria-label="Andromeda"
      className="text-lg font-medium tracking-tight text-white sm:text-xl"
    >
      Andromed<span className="ml-0.5 align-super text-[10px]">a</span>
    </Link>
  );
}

function RotatingBadge() {
  const pathId = useId();
  return (
    <div className="-mt-8 mr-6 hidden shrink-0 items-start md:flex lg:mr-10">
      <div className="relative h-20 w-20 md:h-24 md:w-24 lg:h-28 lg:w-28">
        <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-md" />
        <svg
          viewBox="0 0 200 200"
          className="absolute inset-0 h-full w-full motion-safe:animate-spin-slow"
          aria-hidden
        >
          <defs>
            <path
              id={pathId}
              d="M 100,100 m -70,0 a 70,70 0 1,1 140,0 a 70,70 0 1,1 -140,0"
            />
          </defs>
          <text className="fill-white/80" fontSize={10} fontWeight={300} letterSpacing={3}>
            <textPath href={`#${pathId}`}>
              RETRIEVAL • RANKING • LEARNING • DIAGNOSE • FIX •
            </textPath>
          </text>
        </svg>
      </div>
    </div>
  );
}

export function Hero() {
  const [active, setActive] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  // Re-arms on every change, so clicking a dot also resets the 5s timer.
  useEffect(() => {
    const t = setTimeout(() => setActive((i) => (i + 1) % SLIDES.length), 5000);
    return () => clearTimeout(t);
  }, [active]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black font-sans">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        src={VIDEO_SRC}
      />
      {/* Legibility: the video has bright frames behind white text. */}
      <div aria-hidden className="absolute inset-0 bg-black/45" />

      <div className="relative z-10 flex h-full flex-col px-5 sm:px-8 md:px-12 lg:px-16">
        <nav className="flex items-center justify-between pt-6 sm:pt-8">
          <Logo />
          <div className="hidden items-center gap-12 md:flex">
            {[
              { label: "How it works—", href: "#how" },
              { label: "Pricing", href: "#pricing" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-light tracking-wide text-white transition-opacity duration-300 hover:opacity-70"
              >
                {l.label}
              </Link>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 text-white transition-colors duration-300 hover:border-white/60 sm:h-10 sm:w-10"
          >
            <Menu size={15} />
          </button>
        </nav>

        <div className="flex flex-1 items-center">
          <div className="flex w-full items-start justify-center px-1 sm:px-0 md:mr-16 md:justify-end lg:mr-24">
            <RotatingBadge />
            <div>
              <h1 className="sr-only">Andromeda — Meta ad advisor</h1>
              <div className="relative max-w-2xl" aria-live="polite">
                {SLIDES.map((s, i) => (
                  <div
                    key={s.em}
                    aria-hidden={i !== active}
                    className={`transition-all duration-700 ${EASE} ${
                      i === active
                        ? "relative translate-y-0 opacity-100"
                        : "pointer-events-none absolute inset-0 translate-y-4 opacity-0"
                    }`}
                  >
                    <p className="text-xl leading-[1.45] font-light tracking-tight text-white sm:text-2xl md:text-3xl lg:text-[2.1rem]">
                      {s.before}
                      <span className="underline decoration-white/60 underline-offset-4">
                        {s.em}
                      </span>
                      {s.after}
                    </p>
                    <Link
                      href={s.href}
                      tabIndex={i === active ? undefined : -1}
                      className="mt-6 inline-block text-xs font-light tracking-wide text-white transition-opacity duration-300 hover:opacity-70 sm:mt-8 sm:text-sm"
                    >
                      {s.cta}—
                    </Link>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex items-center gap-2 sm:mt-10">
                {SLIDES.map((s, i) => (
                  <button
                    key={s.em}
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={`Show slide ${i + 1}`}
                    aria-current={i === active}
                    className={`h-1.5 w-1.5 rounded-full transition-all duration-500 sm:h-2 sm:w-2 ${
                      i === active
                        ? "scale-100 bg-white"
                        : "scale-90 bg-white/40 hover:bg-white/60"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="pb-5 sm:pb-8">
          <div className="mb-3 flex items-center justify-between sm:mb-4">
            {["Retrieval", "Ranking", "Learning"].map((m) => (
              <span key={m} className="text-[10px] font-light text-white/50 sm:text-xs">
                {m}
              </span>
            ))}
          </div>
          <div className="flex flex-col gap-4 border-t border-white/10 pt-4 sm:flex-row sm:items-end sm:justify-between sm:gap-0">
            <p className="max-w-md text-[9px] leading-relaxed font-light text-white/40 sm:text-[10px] md:text-xs">
              Reviews Meta ad creative, copy, setup and Ads Manager screenshots through{" "}
              <span className="underline decoration-white/30 underline-offset-2">
                Andromeda-style retrieval
              </span>{" "}
              to show what the delivery system sees.
              <br className="hidden sm:block" /> Fixes ranked by impact, in plain language.
            </p>
            <div className="text-[9px] font-light tracking-wider text-white/40 uppercase sm:text-right sm:text-[10px] md:text-xs">
              <p>Meta ad advisor</p>
              <p>{PLANS.free.quota} free analyses every month</p>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-50 transition-all duration-500 ${EASE} ${
          menuOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        aria-hidden={!menuOpen}
      >
        <div
          className="absolute inset-0 bg-black/90 backdrop-blur-xl"
          onClick={() => setMenuOpen(false)}
        />
        <div
          className={`relative z-10 flex h-full flex-col px-8 pt-8 transition-all duration-500 ${EASE} ${
            menuOpen ? "translate-y-0" : "-translate-y-8"
          }`}
        >
          <div className="flex items-center justify-between">
            <Logo />
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white"
            >
              <X size={16} />
            </button>
          </div>

          <nav className="mt-16 flex flex-col">
            {MENU_LINKS.map((l, i) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                style={{ transitionDelay: menuOpen ? `${150 + i * 75}ms` : "0ms" }}
                className={`py-3 text-4xl font-light tracking-tight text-white transition-all duration-500 hover:opacity-60 sm:text-5xl ${EASE} ${
                  menuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div
            style={{ transitionDelay: menuOpen ? "450ms" : "0ms" }}
            className={`mt-auto mb-10 flex flex-col gap-1 border-t border-white/10 pt-6 text-xs font-light text-white/40 transition-opacity duration-500 ${
              menuOpen ? "opacity-100" : "opacity-0"
            }`}
          >
            <Link href="/sign-up" onClick={() => setMenuOpen(false)} className="hover:text-white/70">
              Start free — {PLANS.free.quota} analyses / month
            </Link>
            <span>Prices in MYR · Pay by card</span>
          </div>
        </div>
      </div>
    </section>
  );
}
