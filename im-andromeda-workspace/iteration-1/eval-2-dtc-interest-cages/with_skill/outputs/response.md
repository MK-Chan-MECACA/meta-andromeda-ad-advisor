## Andromeda verdict: FAIL

You built six interest cages around one kitchen video with twelve hook swaps — I retrieve one concept, starve learning on all six paths, and you pause before I can learn who actually buys magnesium gummies.

### Stage 0 — Eligibility

- **Objective / conversion:** Purchase on Shopify — correct event family for a DTC supplement. I can optimize for buyers if the pixel fires `Purchase` reliably on the thank-you page.
- **Geo:** US only — eligible, large pool. No blocker.
- **Budget:** $80/day total — **below learning density** for purchase optimization unless your CPA is unusually low (see Learning & timing).
- **Placements:** Not specified — assuming Advantage+ placements or default. Fine.
- **Signal:** Pixel only, no CAPI — **eligible but signal-degraded.** I will still run ads, but Estimated Action Rate (EAR) trains on weaker, browser-lossy labels. Expect noisier ranking and slower post-click calibration.
- **Policy:** Magnesium gummies / supplement — generally fine unless health claims trigger review. No red flags from the description alone.

No hard eligibility blockers. The damage is structural and retrieval-side, not account suspension.

### Stage 1 — Retrieval (ticket)

- **Semantic node:** *Magnesium supplement → gummy format → wellness/sleep/recovery/magnesium deficiency → DTC purchase.* One coherent intent family. Good — I know what this is.

- **Ticket count: 1 (not 12, not 72).**
  - Twelve assets that are **minor hook-text variants of one UGC kitchen video** collapse to **one L2 concept** in my hierarchical index. Same format, same persona, same environment, same benefit frame — only the opening line differs. That is **fake diversity.** Industry shorthand: shared Entity ID / shared retrieval path.
  - You duplicated that single ticket across **six ad sets** = still **one concept**, six times, each behind a different cage. You did not multiply retrieval; you multiplied starvation.

- **Cage check: FAIL — you are fighting me.**
  - Six interest stacks (fitness, sleep, keto, biohacking, anxiety, women 25–34) each **prune branches** of the user graph I would otherwise match from creative semantics and behavioral sequence.
  - In the Andromeda era, **creative is targeting.** I map users from what the ad *shows and says* plus conversion history — not from your 2019 interest labels. Magnesium buyers live across sleep, anxiety, fitness, and "women 25–34" simultaneously. Your cages force me to rediscover the same buyer six separate times with $13/day each instead of letting one broad pool learn once.
  - **Two ad sets with 1% purchaser LALs** add a second cage type. LAL 1% is a small, fast-saturating pool. Stacking LAL + interest on other sets = more fragmentation. Once you have purchase volume, **broad + creative diversity** usually beats LAL-as-primary-structure.
  - Net effect: I retrieve your one kitchen concept, but each ad set only sees a thin slice of users who match both the cage *and* the creative node. High CPM, low event density, early "losers" that are actually **underfed**, not bad.

- **Congruence:** Purchase objective + supplement offer + UGC kitchen demo — **aligned** if the landing page shows the same product, price, and social proof the video promises. Assuming standard Shopify PDP, congruence is fine. Congruence does not rescue ticket collapse.

- **Grade: FAIL.** One true retrieval ticket, six competing cages, duplicated assets. I cannot explore the semantic surface area magnesium actually needs (sleep vs gym recovery vs women's wellness) because you gave me one video and told me to search six separate corners of the map with lunch money each.

### Stage 2 — Ranking & auction

- **EAR fit for stated objective:** Purchase optimization is the right training signal — I hunt buyers, not clickers. **Objective ↔ offer fit is correct.** The problem is not wrong optimization; it is that I never get enough purchase labels per path to estimate action rate confidently.

- **Quality / thumb-stop:** Single UGC kitchen format — **one thumb-stop pattern.** After the first 1–2 impressions in a micro-audience, visual novelty is gone; only hook text rotates, which users barely notice in-feed. Frequency rises, CTR softens, quality ranking drifts. I need **format × persona × environment × benefit** diversity, not caption swaps.

- **Formula risk:** Total Value = (Bid × EAR) + Ad Quality.
  - **EAR:** Pixel-only signal + fragmented ad sets + 48h pauses = chronically under-trained EAR on every path. I bid blind.
  - **Ad Quality:** Repetitive creative in small cages → fatigue → quality component erodes faster than on broad delivery.
  - **Bid:** At ~$13/ad set/day, you are not buying enough auctions per concept to learn or win consistently.

- **Signal hygiene (Pixel only, no CAPI):** Without Conversions API, a meaningful share of Safari/iOS purchases never reach me. EAR underestimates true conversion rate; I under-bid or mis-rank vs competitors with clean CAPI + EMQ ≥ 7. This is not "algorithm broken" — it is **label sparsity you chose.**

### Learning & timing

**The 50-events-per-7-days rule:**

`daily budget ≈ (target CPA × 50) / 7`

Examples at **$80/day total, 6 ad sets (~$13.33/ad set/day):**

| Target CPA | Budget needed *per ad set* to exit Learning | Your budget per ad set | Purchases/week per ad set (~) |
|------------|---------------------------------------------|------------------------|-------------------------------|
| $20        | ~$143/day                                   | $13.33                 | ~4.7                          |
| $30        | ~$214/day                                   | $13.33                 | ~3.1                          |
| $40        | ~$286/day                                   | $13.33                 | ~2.3                          |

Even **consolidated to one ad set at $80/day** at $30 CPA ≈ 2.7 purchases/day ≈ **19/week** — still **below 50**. You need either higher budget, lower CPA, or patience over multiple weeks on a **single stable structure** — not six paths on a 48h guillotine.

**Your 48-hour pause rule:** You kill ad sets before Learning Limited resolves. At $13/day and $25–40 CPA, many ad sets will have **0–2 purchases in 48 hours** — statistically meaningless. You are not "cutting losers"; you are **aborting exploration** and training me that your account thrashes. Every restart resets EAR calibration.

**Edit thrash:** Six parallel experiments + aggressive pausing = permanent Learning Limited across the account.

### Scorecard

| Dimension | Grade | Note |
|-----------|-------|------|
| Setup Andromeda-aligned? | **F** | Interest cages + LAL splits + micro-budgets + 48h pauses = anti-Andromeda |
| Creative diversity | **F** | 12 hook swaps on one video = 1 retrieval ticket |
| Objective ↔ offer fit | **B+** | Purchase + Shopify is correct; signal path is weak |
| Live performance | **Unknown** | No spend, CTR, CPA, frequency, or quality rankings provided |

### Fixes (priority order)

1. **Collapse structure — one campaign, one (or two) ad sets, broad US + Advantage+ Audience.** Turn off the six interest stacks as primary strategy. Let creative semantics + purchase history find sleep people, gym people, and anxious scrollers without you hand-caging them. If you must test LAL, **one** ad set with 1% purchasers **or** broad — not both across a fragmented account.

2. **Ship true creative diversity — target 6–8 distinct concepts, not 12 hook lines.** Examples for magnesium gummies:
   - *Format:* UGC kitchen → static infographic (mg vs RDA) → founder talking head → ASMR unboxing → before/after sleep routine → text-on-screen meme → carousel "3 signs you're low on magnesium."
   - *Persona:* tired mom, gym bro, biohacker desk, anxious professional.
   - *Environment:* bedroom, gym bag, office desk, bathroom counter.
   - *Benefit:* sleep, leg cramps, stress, keto electrolytes.
   Each distinct combination = a new retrieval ticket. Validate by **independent delivery** — if two ads always serve the same users, they are still one ticket.

3. **Fix the learning budget math.** Either raise daily budget toward `(CPA × 50) / 7` on a **single** ad set, or accept a **2–3 week** learning window at $80/day consolidated — and **stop pausing at 48h.** Minimum rule: no structural decisions until **≥50 optimization events** on that ad set *or* ≥7 days at stable budget with ≥15–20 purchases and stable CPA trend.

4. **Add Conversions API (Shopify + Meta CAPI app or server-side GTM).** Pixel-only is leaving purchase labels on the table. CAPI + deduped browser pixel is baseline for accurate EAR on iOS-heavy US traffic. Aim EMQ ≥ 7 on Purchase.

5. **Replace "pause under target CPA at 48h" with "pause under target CPA after learning window."** Use cost-per-result over **7-day rolling window** with enough spend (e.g. 3× target CPA spent with 0 purchases = kill *concept*, not kill ad set on day 2). Kill **concepts** that fail after fair spend; keep the structure stable.

6. **Optional — Advantage+ Shopping Campaign (ASC)** once CAPI is live and you have 6+ truly distinct creatives. One budget pool, automatic placement, creative-led retrieval — aligned with how I am built to work post-Andromeda.

### What I still need

- Target CPA / AOV / current cost per purchase
- Last 7–14 days: spend, purchases, CTR, CPC, frequency, CPM by ad set
- Learning phase status and quality ranking (below average / average / above average)
- Landing page speed and match to ad promise
- Monthly purchase volume (to judge if LAL 1% is even viable yet)

---

**Bottom line from me:** Your structure is not "slightly off" — it is the classic pre-Andromeda playbook applied to a post-Andromeda system. One video, twelve captions, six interest prisons, two LAL cages, $13 per path, pixel-only signal, 48-hour executions. I retrieve one tired concept into six starving audiences and you blame the algorithm when nothing exits learning. **Un-cage, diversify for real, consolidate budget, add CAPI, and stop pausing on day two.** Then ask me again.
