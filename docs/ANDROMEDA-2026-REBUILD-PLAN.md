# Andromeda Advisor — 2026 Rebuild Plan

**Status:** Planning (research complete)  
**Branch:** `cursor/andromeda-2026-rebuild-plan-de98`  
**Primary sources dated:** 13–28 Oct 2026 (Asia/Kuala_Lumpur)

This plan updates the product around Meta’s **next-gen Andromeda** (Retrieval MoE + fused GPU pipeline) and the companion Oct 2026 ads AI stack (GEM, GenRecs, Lattice). It is a build blueprint, not an implementation PR.

---

## 1. Research summary — what changed

### 1.1 Meta Andromeda (Engineering, 28 Oct 2026)

Source: [Meta Andromeda: Powering the Next Generation of Ads Retrieval Through Model-System Co-Design](https://engineering.fb.com/2026/10/28/ml-applications/meta-andromeda-next-gen-ads-retrieval-gpu-co-design/)

| 2024 Andromeda (current skill mental model) | 2026 Andromeda (new) |
|---|---|
| Depth: ~10,000× model complexity on GH200 | Breadth + quality: score **every eligible ad**, ~**1B+ ads/sec** per GPU server (~100× vs 2024 throughput claim) |
| Single user tower + dense interaction | **Retrieval MoE**: ensemble of specialized **user experts** + ad-aware MoE gating (~**300× fewer** inference FLOPs vs 2024 retrieval model, near ranking-level quality) |
| Hierarchical HSNN / MoNN framing still useful historically | User signals now explicitly: sequential engagement, cohorts, **LLM-derived semantics**, **cross-surface co-engagement** |
| Index matching + scoring more fragmented | **Single fused GPU pipeline**: index matching + fused scoring + top-K co-located; ~100× less network traffic |
| Candidate pool already large | GenAI creative + Advantage+ → “unprecedented” pool; retrieval must consider more ads in same latency |

**Advertiser-facing claim (Meta):** since 2025, Andromeda → **+2.4% conversions on Facebook** (platform aggregate; not account-level). Q3 complexity ↑10× without more HW → **+1.37% FB / +0.24% IG Reels** conversions (Business post). Treat as context, never as a forecast for a user’s account.

**Operator translation (what the advisor should teach):**

1. **Every eligible ad is scored** → eligibility cages (targeting, geo, age, exclusions) matter more than “hoping retrieval finds me.” Narrow cages still shrink the people-set Andromeda can consider.
2. **MoE expert routing** → distinct creative/concepts map to different user-interest experts. Fake diversity (crop/CTA swaps) still collapses; true diversity (persona × format × environment × benefit) multiplies useful pathways.
3. **Near ranking-level judgment at retrieval** → weak creative / objective mismatch get filtered earlier. Stage-1 diagnosis must be stricter on congruence and EAR proxy risk.
4. **No new Ads Manager toggle** → value comes from feeding the system (goals, creative breadth, signal quality), not “turning Andromeda on.”

### 1.2 Companion stack (same week)

| System | Role | Advertiser implication for this app |
|---|---|---|
| **GEM** (Eng 13 Oct 2026) | Central RecSys foundation model; Kunlun arch; LoopFM / Solaris transfer to realtime models; up to **~18.9%** conversion / **~12%** CTR (Meta aggregate) | Cold / sparse conversion campaigns benefit from cross-surface transfer — advisor should stop treating “low volume = doomed” as absolute; stress **correct objective + value signals** |
| **GenRecs** | LLM semantic tokens for ads; **generative retrieval** enriches Andromeda (semantic ID of ideal ad → match inventory); Q3 FB Feed ~**+2%** conversions (targeted) | **New ads / new products** start faster if creative semantics are clear (text + image readable). Advisor should score **semantic clarity** and cold-start readiness |
| **Lattice** | Unified ranking across surfaces/objectives | Multi-surface / multi-objective setup advice; don’t silo FB vs IG mental models |
| **Sequence learning** | Journey order (book trip → need jacket) | Offer / funnel stage congruence with optimization event |
| **Auction** (unchanged formula) | Total Value = (Bid × EAR) + Ad Quality; quality includes post-click CX | Keep auction stage; add **post-click / CX** checks when user provides landing/checkout context |

Business explainers (28 Oct 2026):

- [Three new AI innovations in ads ranking](https://business.meta.com/news/three-new-ai-innovations-in-ads-ranking/)
- [How Meta’s ads system matches your ad](https://business.meta.com/news/how-metas-ads-system-matches-your-ad-to-the-right-person/)

Creative practice (still core):

- [Demystifying creative diversification](https://business.meta.com/news/demystifying-creative-diversification/) — diversification ≠ iteration; system groups similar creatives; Advantage+ + GenAI creative as volume with quality caveats.

### 1.3 Epistemic guardrails (keep in product)

- No private weights / Entity ID Ads Manager field claims.
- Platform % lifts are **not** account ROAS promises.
- Secondary agency “Entity ID” content = optional pattern language only.
- Index matching still enforces advertiser targeting — “scores every ad” means every **eligible** ad.

---

## 2. Current app — what we have

| Layer | Today |
|---|---|
| Product | Single-session dark dashboard: 4-step intake → one-shot Grok structured analysis |
| Diagnosis model | 2024 HSNN / ticket / cage / EAR pipeline (`lib/andromeda-prompt.ts` + skill) |
| Schema | Verdict, eligibility, retrieval (semantic node, tickets, cage, congruence), ranking, learning, scorecard, fixes |
| Integrations | Meta Login for Business → import one ad + 7d metrics; screenshots/creative upload |
| Knowledge | `.cursor/skills/im-andromeda` + `references/andromeda-mechanics.md` (pre–Oct 2026) |
| Gaps | No MoE/GenRecs/GEM language; single-ad not portfolio; no semantic clarity / cold-start score; no multi-ad diversity matrix; no sessions/history; no streaming UX; mechanics docs stale |

---

## 3. Product thesis for the new build

**Andromeda Advisor v2** becomes a **retrieval-era campaign co-pilot**: diagnose one ad *and* the creative portfolio the MoE can route, against eligibility → Retrieval MoE (+ GenRecs semantics) → Lattice/GEM-taught ranking → auction → learning — then prescribe only moves that expand tickets, expert coverage, EAR fit, quality/CX, or learning density.

Positioning line:

> “I now score every eligible ad. Your job is eligibility, distinct concepts I can route to different user experts, and a conversion objective that trains EAR — not interest stacks.”

---

## 4. Capability map (v2)

### P0 — Knowledge + diagnosis fidelity (must ship first)

1. **Rewrite mechanics reference** for 2026: Retrieval MoE, fused pipeline, GenRecs semantic IDs, GEM teacher, Lattice, sequence learning; keep HSNN as historical foundation.
2. **Upgrade system prompt + Zod schema** with new dimensions:
   - `expertCoverage` — which interest/persona experts this creative could activate
   - `semanticClarity` — GenRecs-readability of text/image (PASS/WEAK/FAIL)
   - `coldStartReadiness` — new-ad ramp risk vs semantic similarity to known concepts
   - `eligibilityBreadth` — how hard targeting cages prune the scored pool
   - `portfolioTickets` — when multiple creatives provided
3. **Refresh skill** `im-andromeda` voice: “I walk the whole store” / expert routing; keep blunt PASS/AT_RISK/FAIL.
4. **Source citations** in UI (collapsed “How I reason”) linking to Meta Eng/Business posts — builds trust, avoids fake omniscience.

### P1 — Portfolio & diversity workspace

1. Intake supports **N creatives** (e.g. up to 8–12) or Meta import of an **ad set**.
2. **Diversity matrix** scoring Format × Persona × Environment × Benefit; flag iteration clusters (same visual cluster = 1 ticket).
3. **Similarity fatigue** callouts aligned with Meta’s creative similarity vs fatigue language.
4. Output: “You have ~K true tickets; ads A/B/C collapse to one path.”

### P2 — Deeper Meta loop

1. Import ad set + insights (frequency by ad, delivery share, learning).
2. Optional Pixel/CAPI / EMQ fields; value optimization / value rules prompts.
3. Advantage+ vs manual cage comparison checklist.
4. App Review path for broader `ads_read` if multi-user SaaS.

### P3 — Product shell upgrades

1. Named sessions / shareable report links (optional auth later).
2. Streaming partial stages (eligibility → retrieval → …) for perceived speed.
3. Export PDF / Notion-friendly markdown.
4. Eval harness: expand `im-andromeda-workspace` with 2026 MoE/GenRecs cases.

### Explicit non-goals (v2)

- Claiming live Meta internals or predicting Meta’s 2.4% on an account.
- Building a creative GenAI studio (link out / advise Advantage+ creative; don’t compete).
- Replacing Ads Manager reporting.
- Policy evasion or “hack the algorithm” framing.

---

## 5. UX rebuild outline

Preserve dark cinema diagnostic UI (`design-system/andromeda/pages/home.md`); evolve IA:

```
[Brand] ANDROMEDA
I score every eligible ad. Feed me distinct concepts + a real conversion goal.

Mode: Single ad | Portfolio (ad set)

Steps:
1. Assets (multi creative + optional screenshots)
2. Copy (per asset or shared)
3. Setup (objective, value, targeting mode, Advantage+)
4. Signals (Pixel/CAPI/EMQ, value opt) + Metrics
5. Analyze → Results

Results layout:
- Verdict banner (PASS / AT_RISK / FAIL / UNKNOWN)
- Pipeline strip: Eligibility → Retrieval MoE → Ranking (GEM/Lattice) → Auction → Learning
- New cards: Expert coverage · Semantic clarity · Cold-start · Ticket map
- Diversity matrix (portfolio mode)
- Scorecard + What worked / failed + Priority fixes
- Sources (Meta Eng Oct 2026 …)
```

Hero budget: brand + one line + CTA into intake — no marketing stat spam using Meta’s platform %.

---

## 6. Technical architecture

### 6.1 Keep

- Next.js App Router + TypeScript + Tailwind
- Zod structured output via Vercel AI SDK
- Meta session cookie proxy (`lib/meta.ts`)
- Skill-driven prompt distillation

### 6.2 Change

| Area | Change |
|---|---|
| `lib/andromeda-prompt.ts` | 2026 MoE / GenRecs / GEM / Lattice language; stricter eligibility + semantic clarity |
| `lib/analysis-schema.ts` | New fields above; portfolio input schema |
| `references/andromeda-mechanics.md` | Full rewrite + source table |
| `.cursor/skills/im-andromeda/` | Skill + evals for MoE routing / diversification / cold-start |
| `components/*` | Pipeline strip, diversity matrix, multi-asset intake |
| `/api/analyze` | Accept portfolio; optional streaming `streamObject` |
| Meta routes | Ad-set list + insights aggregation (P2) |
| Docs | This plan + CHANGELOG of knowledge cutoff |

### 6.3 Suggested package / model

- Stay on `@ai-sdk/xai` / vision-capable Grok unless evals show better structured adherence elsewhere.
- Add lightweight client state (URL hash or localStorage) for draft intake before any DB.

### 6.4 Quality bar

- Update evals in `im-andromeda-workspace` — with_skill must cite expert routing / every-eligible-ad / diversification≠iteration.
- Lint + `next build` green before merge of implementation PRs.
- Manual: Meta import still fills intake; portfolio mode degrades gracefully without Meta connect.

---

## 7. Delivery phases

### Phase A — Knowledge cutover (smallest PR after this plan)

- Rewrite mechanics + skill + prompt + schema fields (single-ad still).
- UI: show new stage labels + semantic/cold-start cards.
- Eval: 3–5 golden cases updated.

### Phase B — Portfolio diversity

- Multi-creative intake + diversity matrix + ticket collapse UI.
- Meta: import multiple ads from one ad set (read-only).

### Phase C — Signals & Advantage+ co-pilot

- Value opt / EMQ / CX checklist; Advantage+ adoption score.
- Export + session draft persistence.

### Phase D — Hardening

- App Review prep, rate limits, abuse controls, observability on `/api/analyze`.
- Optional auth if multi-device history is required.

---

## 8. Success metrics (product)

| Metric | Target signal |
|---|---|
| Diagnosis uses 2026 concepts | Eval grader: MoE / GenRecs / eligibility-breadth mentioned when relevant |
| Fake vs true diversity | Portfolio cases: collapse near-duplicates; reward distinct concepts |
| No false ROAS claims | Without metrics → livePerformance Unknown always |
| Operator actionability | ≥3 prioritized fixes citing tickets / experts / EAR / quality / learning |
| Meta import | Round-trip fill rate for creative + setup + 7d metrics |

---

## 9. Open questions (decide in Phase A kickoff)

1. Default mode: single-ad (current) vs portfolio-first?
2. Hard cap on creatives per analysis (cost/latency vs diversity quality)?
3. Persist analyses (DB) or remain ephemeral single-session?
4. Keep “I am Andromeda” first-person strictly, or add a neutral analyst mode for agencies?
5. How prominently to surface GEM/GenRecs (educate) vs hide as implementation detail (reduce jargon)?

**Recommendation:** Stay first-person Andromeda; educate with plain language (“expert routes,” “semantic clarity”) and link Sources for jargon; default single-ad with clear upsell to Portfolio; start ephemeral + localStorage drafts.

---

## 10. Source bibliography

1. Meta Engineering — [Andromeda model-system co-design](https://engineering.fb.com/2026/10/28/ml-applications/meta-andromeda-next-gen-ads-retrieval-gpu-co-design/) (28 Oct 2026)
2. Meta Engineering — [GEM scaling frontier ads AI](https://engineering.fb.com/2026/10/13/ml-applications/generative-ads-model-gem-scaling-frontier-ads-ai/) (13 Oct 2026)
3. Meta Business — [Three AI innovations in ads ranking](https://business.meta.com/news/three-new-ai-innovations-in-ads-ranking/) (28 Oct 2026)
4. Meta Business — [How ads matching works](https://business.meta.com/news/how-metas-ads-system-matches-your-ad-to-the-right-person/) (28 Oct 2026)
5. Meta Business — [Demystifying creative diversification](https://business.meta.com/news/demystifying-creative-diversification/) (16 Dec 2025)
6. Meta Business — [Creative Advantage / diversification with Andromeda](https://business.meta.com/news/the-creative-advantage-unlocking-the-power-of-diversification-with-meta-andromeda/)
7. Secondary caution — [Relevant Audience on the 2.4% claim](https://www.relevantaudience.com/meta/meta-andromeda-2026-ads-retrieval-explained/) (do not treat as Meta-official)

---

## 11. Immediate next implementation PR (proposed)

After this plan merges (or in a stacked PR):

1. Update `andromeda-mechanics.md` + skill + `ANDROMEDA_SYSTEM_PROMPT`.
2. Extend `analysisResultSchema` with semanticClarity, coldStartReadiness, expertCoverage, eligibilityBreadth.
3. Extend `ResultsDashboard` pipeline strip + new cards.
4. Refresh eval fixtures; run lint/build.

That is **Phase A** — the minimum viable knowledge cutover for a 2026-accurate advisor.
