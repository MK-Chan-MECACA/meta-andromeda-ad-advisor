# Andromeda verdict: **FAIL**

Yes — your structure is killing me. You built a 2019 account inside a 2026 retrieval engine. I cannot retrieve broadly, I cannot learn stably, and you handed me one ticket dressed up as twelve. Purchase objective is correct. Everything else fights how I work.

---

## Stage 0 — Eligibility & signal

**What I see:** Purchase objective, Shopify pixel, US geo, $80/day. Objective is fine. Geo is fine. Budget is thin but workable *if* you stop splitting it six ways.

**What breaks eligibility-adjacent signal:**

| Signal layer | Status | My read |
|---|---|---|
| Pixel (browser) | Live | Partial. iOS, Safari, ad blockers — you lose a chunk of purchase events before they reach me. |
| CAPI (server-side) | **Missing** | **Critical gap.** I get delayed, deduplicated, incomplete conversion feedback. EAR (Event Aggregation & Ranking) quality drops. I rank and retrieve with a blurry purchase map. |
| Event match quality | Unknown (likely weak) | No CAPI usually means lower EMQ. Weaker EMQ → weaker lookalike seed → weaker LAL ad sets. |
| LAL 1% purchasers | Seeded on noisy data | Two ad sets on LAL sounds smart. If the seed is pixel-only and thin, I am matching to a fuzzy ghost of your buyers. |

**Stage 0 grade:** **D** — You are eligible to run, but your conversion signal is underpowered for Purchase optimization at $80/day.

---

## Stage 1 — Retrieval (this is where you are bleeding)

This is my job. I map users, context, and ads into embedding space. Ads whose creative coordinates sit close to a user's coordinates get retrieved. I do **not** need you to pre-segment fitness people from sleep people from keto people. **Your creative tells me who to retrieve.**

### Problem 1: Interest cages (six ad sets)

You built six manual retrieval prisons:

1. Fitness interest stack  
2. Sleep interest stack  
3. Keto interest stack  
4. Biohacking interest stack  
5. Anxiety interest stack  
6. Women 25–34  

Plus LAL 1% on two of them.

Each cage gets ~$13/day ($80 ÷ 6). Each cage has the same 12 ads. You are asking me to solve six separate retrieval problems with six separate micro-budgets and six separate learning loops — for a product (magnesium gummies) whose buyers span *all* of those interests anyway.

**What this does to me:**

- **Retrieval pruning:** I index your ads once per entity/concept, but your ad-set walls stop budget from flowing to wherever I find the cheapest purchase embedding match. A sleep-angle creative that would convert a fitness mom in the open pool never gets spend because it lives inside the "sleep" cage.
- **Duplicate auction entries, zero new tickets:** Same video in six ad sets does not give me six retrieval angles. It gives me one concept submitted six times with audience filters bolted on. I do not reward that.
- **LAL inside cages is worse:** A 1% purchaser lookalike is already narrow. Putting it inside an interest stack is a cage inside a cage. I retrieve fewer people, faster.

**Retrieval ticket count:** You believe you have **12 tickets**. I count **~1 ticket** — one UGC kitchen video, one persona, one environment, one benefit frame. Hook-text swaps on the same footage are not Format × Persona × Environment × Benefit diversity. They are cosmetic variants of a single embedding cluster.

### Problem 2: Fake creative diversity

Your 12 "creatives" are minor hook-text variants of one UGC kitchen video. From my index:

| What you think you uploaded | What I index |
|---|---|
| 12 ads | ~1 creative concept |
| Hook A vs Hook B vs Hook C | Same visual embedding, same persona, same scene |
| "Testing creative" | Testing copy labels on one ticket |

I need **true concept diversity** to retrieve different buyer clusters:

- **Format:** UGC kitchen video → static review screenshot → before/after sleep graph → founder talking head → ASMR unboxing  
- **Persona:** Stressed professional vs new mom vs gym recovery bro vs menopause woman vs student  
- **Environment:** Kitchen → bedside table → gym bag → office desk → bathroom shelf  
- **Benefit:** Sleep / muscle recovery / anxiety calm / leg cramps / gut regularity / period support  

Magnesium gummies touch all of those. One kitchen UGC with hook swaps retrieves one slice. You are invisible to everyone outside that slice.

**Stage 1 grade:** **F** — Interest cages plus fake diversity. I cannot do my job.

---

## Stage 2 — Ranking & auction (Lattice)

Assume I retrieve you. Lattice ranks you on predicted conversion value, estimated action rate, and quality. Your setup hurts all three:

| Factor | Your setup | Effect |
|---|---|---|
| **EAR / conversion signal** | Pixel-only | Noisy purchase feedback → bad p(CVR) estimates |
| **Quality / relevance** | Same ad repeated across cages | Engagement patterns look artificial; no fresh concept signal |
| **Bid efficiency** | Budget split 6 ways | None of the ad sets exit learning; CPA looks bad everywhere |
| **Creative freshness** | 1 concept | Fatigue hits one cluster hard; no rotation of fresh embeddings |

Even if I retrieve you for a user, you may lose the auction because my predicted purchase probability is weak — not because magnesium gummies fail, but because your signal and structure starve the model.

**Stage 2 grade:** **D** — Retrieve-then-lose is likely even when retrieval happens.

---

## Learning — you are sabotaging it on purpose

**Your rule:** Pause anything under target CPA after 48 hours.

**What I need:** Stable ad sets, continuous spend, enough purchase events to model who converts. Rule of thumb: **50 purchases per ad set** before you judge CPA (not 48 hours). At $80/day total and ~$30–50 AOV magnesium gummies, you might see 2–4 purchases/day account-wide if things work. That is **4–8 days for the whole account**, not 48 hours per cage.

**What your 48-hour rule does:**

1. Ad set enters learning  
2. Spends ~$26 in 48h (at $13/day per cage)  
3. Maybe 0–1 purchases — statistically meaningless  
4. You pause it  
5. I reset. Budget shifts. Another cage wobbles. Learning never completes.  
6. Repeat until you conclude "Meta doesn't work for magnesium"

This is **learning thrash**. You are manually resetting my gradient every two days. I cannot converge. Your LAL ad sets are especially harmed — lookalikes need volume to differentiate buyers from random US users.

**Learning grade:** **F**

---

## Scorecard

| Dimension | Grade | Notes |
|---|---|---|
| Objective (Purchase) | **B+** | Correct for Shopify DTC |
| Geo (US only) | **B** | Fine; not the bottleneck |
| Budget ($80/day) | **C** | Viable only consolidated; fatal split 6 ways |
| Targeting structure | **F** | Six interest cages + caged LALs = pre-Andromeda |
| Creative diversity | **F** | 12 hook variants ≈ 1 retrieval ticket |
| Conversion signal (CAPI) | **F** | Pixel-only = weak EAR / EMQ |
| Learning stability | **F** | 48-hour CPA pausing resets learning constantly |
| **Overall Andromeda alignment** | **F** | Structure actively fights retrieval + learning |

---

## Fixes — prioritized, mechanistic, in order

Do these in sequence. Do not "test" all at once.

### 1. Consolidate structure (this week)

**Kill the six interest cages.**

Move to:

```
Campaign: Purchase | $80/day
└── Ad set: US | Broad (18–65+ or 25–54+) | No interest stacks
    └── 6–10 truly different ads (see #3)
```

Or, if your account has ASC access and catalog is clean:

```
Advantage+ Shopping Campaign | $80/day | US | Purchase
└── 6–10 concept-diverse creatives, no interest targeting
```

Keep **one** optional ad set for LAL 1% purchasers — **broad, no interest layering** — only after CAPI is live and you have 100+ purchase events in 30 days. Not two. One.

**Why:** One pool, one learning loop, full budget density, I retrieve by creative embedding across all US buyers who might want magnesium.

### 2. Install CAPI immediately (this week)

- Shopify → Meta Conversions API (native integration or via partner)  
- Send `Purchase`, `AddToCart`, `InitiateCheckout` server-side  
- Enable event deduplication (same `event_id` pixel + CAPI)  
- Verify EMQ in Events Manager — target **Good (8+)** on Purchase  

**Why:** Cleaner EAR signal → better retrieval embeddings for purchasers → better LAL seed → better ranking p(CVR).

### 3. Replace fake diversity with 6 real concepts (next 2 weeks)

Stop hook-swapping one video. Produce **6 distinct tickets minimum:**

| # | Format | Persona | Environment | Benefit hook |
|---|---|---|---|---|
| 1 | UGC selfie | Tired mom | Kitchen morning | "I stopped waking up at 3am" |
| 2 | UGC selfie | Gym guy | Post-workout | "Leg cramps gone in a week" |
| 3 | Static / carousel | Office worker | Desk + coffee | "Calm focus without melatonin hangover" |
| 4 | UGC | Woman 35+ | Bedside nightstand | "Perimenopause sleep finally" |
| 5 | Testimonial screenshot | Anxiety sufferer | Phone screen | "My naturopath said try magnesium first" |
| 6 | Product demo | Keto dieter | Pantry / macros | "Zero sugar, actually tastes good" |

Each should look like a **different ad a different creator made** — not the same kitchen clip with caption edits.

**Why:** Each concept is a new embedding cluster. I retrieve different users per concept. Budget flows to whichever concept matches cheapest purchases today.

### 4. Fix the learning rule (immediate)

**New rule:**

- **No pauses for 7 days** after launch (14 days if <3 purchases/day account-wide)  
- Judge at **ad level**, not ad-set level, after **≥50 purchases** or **≥$500 spend per ad**  
- Pause only **ads** with statistically bad CPA, not entire ad sets  
- Never pause the last 2–3 ads in an ad set — keep retrieval coverage  

**Why:** I need time and volume. 48-hour ad-set pausing guarantees permanent "Learning Limited."

### 5. Budget math — be honest

At $80/day consolidated:

- ~$560/week → expect 10–20 purchases/week if CPA is $30–50  
- That is enough to learn **one** ad set, not six  
- If CPA target is aggressive (<$25), either raise budget to $150/day or widen target to $40 until signal stabilizes  

Do not add cages to "scale." Add **concepts**.

### 6. What to keep from your current setup

- Purchase objective ✓  
- US-only ✓  
- UGC-style content ✓ (but multiply personas, not hooks)  
- LAL idea ✓ (after CAPI + seed volume, one broad ad set only)  

### 7. What to delete permanently

- Interest stacks (fitness, sleep, keto, biohacking, anxiety, women 25–34 as separate ad sets)  
- Hook-only variants as "creative testing"  
- 48-hour CPA pause rule  
- Pixel-only setup  

---

## What I would do if I were you — 14-day rebuild

| Day | Action |
|---|---|
| 1 | CAPI live. Consolidate to 1 broad Purchase ad set. Kill 5 cages. |
| 1–2 | Launch best existing UGC as placeholder (1 ad, not 12 variants). |
| 3–10 | Ship 5 new concepts (different persona/env/benefit). Total 6 live ads. |
| 7 | First read — cut worst **ad**, not ad set. |
| 14 | Second read — scale budget 20% if CPA within target. Add 2 new concepts, pause 2 fatigued ads. |

---

## Bottom line

You asked if your structure is killing Andromeda. **Yes.**

You are manually doing the opposite of what I was built for: creative-led retrieval at scale with consolidated learning. Six interest cages with twelve hook clones and 48-hour pausing is a machine designed to look busy while guaranteeing I never find your buyers efficiently.

**Un-cage. One pool. Real concepts. CAPI. Patience.**

Do that and I can retrieve magnesium buyers across sleep, fitness, anxiety, and keto — not because you told me those interests, but because your ads *show* me those people through embeddings.

---

*Live performance: UNKNOWN — no spend metrics provided. This verdict is mechanistic readiness only.*
