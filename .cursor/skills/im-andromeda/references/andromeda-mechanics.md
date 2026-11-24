# Andromeda mechanics (reference)

Load this when the user wants technical depth or when a diagnosis hinges on expert routing, semantic clarity, eligibility breadth, or auction math.

**Knowledge cutoff for this file:** Meta Engineering / Business posts through **28 Oct 2026** (Asia/Kuala_Lumpur).

## What Andromeda is (2026)

Meta's personalized **ads retrieval** engine — Stage 1 of the cascade:

**Eligibility (index matching) → Andromeda retrieval (MoE) → Lattice ranking (GEM-taught) → Auction**

Job: tens of millions of eligible ads → a few thousand candidates, in milliseconds.  
**2026 claim:** score **every eligible ad** with near ranking-level judgment at retrieval scale (~1B+ ads/sec per GPU server; ~100× throughput vs 2024 Andromeda system per Meta Engineering).

Hardware lineage: NVIDIA Grace Hopper (GH200) co-design; MTIA mentioned historically; Meta–NVIDIA kernel work continues toward Grace Blackwell.

## 2024 → 2026 architecture shift

| Era | Mental model |
|-----|--------------|
| **2024** | Depth: ~10,000× model capacity; hierarchical HSNN / MoNN towers; tens of millions ads/sec/GPU |
| **2026** | Breadth + quality: **Retrieval Mixture-of-Experts**; fused single-GPU pipeline (index matching + scoring + top-K); ~300× fewer inference FLOPs vs 2024 retrieval model while approaching ranking-level quality |

HSNN / MoNN remain useful historical framing. Prefer **MoE expert routing** language for current diagnoses.

### Retrieval MoE (operator translation)

1. **User experts** — ensemble of specialized user towers (not one generic user embedding). Signals include sequential ad engagement, user cohorts, **LLM-derived semantic features**, and **cross-surface co-engagement**.
2. **Contextualized ad tower** — ad content fused with real-time serving context.
3. **Ad-aware MoE gating** — routes each candidate to the top-K most relevant user experts → user–ad relevance score.

**Advertiser meaning:** distinct creative concepts can activate different expert pathways. Near-duplicate hooks collapse to one path. True diversity = Format × Persona × Environment × Benefit.

### Fused GPU pipeline

Index matching (targeting rules), fused scoring, and top-K run co-located on one GPU server. Compact request (user features + targeting query) in; top-K out. ~100× less network traffic vs shipping huge candidate lists.

**Advertiser meaning:** “I score every ad” means every **eligible** ad. Narrow targeting / exclusions still shrink who can see you — cages prune the scored pool before MoE magic helps.

## Companion stack (Oct 2026)

| System | Role | Operator implication |
|--------|------|----------------------|
| **GenRecs** | LLM semantic tokens for ads; generative retrieval enriches Andromeda (ideal semantic ID → match inventory) | Clear text + image semantics help **new ads / new products** ramp. Score **semantic clarity** and **cold-start readiness**. |
| **GEM** | Central RecSys foundation model; transfers intelligence to realtime rankers (LoopFM / Solaris) | Sparse conversion volume is less fatal if objective + value signals are correct; cross-surface transfer helps. |
| **Lattice** | Unified ranking across surfaces / objectives | Don’t silo FB vs IG mental models. |
| **Sequence learning** | Order of actions in the journey | Offer / funnel stage should match optimization event. |
| **Auction** | Total Value = (Bid × EAR) + Ad Quality | Quality includes post-click CX (surveys, hides, landing friction). |

Platform aggregate lifts Meta publishes (e.g. Andromeda +2.4% FB conversions since 2025) are **not** account forecasts. Never promise them.

## Legacy hierarchy (still useful for “Entity ID” talk)

When discussing creative clustering / shared paths:

| Layer | Granularity | Advertiser meaning |
|-------|-------------|--------------------|
| L1 | Coarse topic/intent | Branch of the creative tree |
| L2 | Sub-cluster / angle | Distinct concept (persona/format/benefit) |
| L3 | Individual ad | Exact asset inside a concept |

**Entity ID (industry term):** semantically similar creatives share retrieval paths / tickets. Not an official Ads Manager field. Validate by independent delivery of distinct concepts.

## Advertiser implications (2026)

1. **Eligibility first** — I score every eligible ad; cages decide who is eligible.
2. **Creative is targeting** — MoE routes concepts to user experts; broad / Advantage+ often beats stacked interests/LALs once conversion history exists.
3. **Diversity ≠ volume / iteration** — crop/CTA swaps ≈ 1 ticket; distinct concepts ≈ multiple expert pathways.
4. **Semantic clarity** — GenRecs reads text + image; mushy creatives cold-start poorly.
5. **Objective trains EAR** — conversations ≠ purchase; send value when it matters.
6. **Signal quality** — Pixel + CAPI, EMQ ≥ 7 when claiming “algorithm broken.”
7. **Learning** — ~50 optimization events / 7 days; `daily budget ≈ (CPA × 50) / 7`. GEM transfer helps sparse cases but does not erase bad proxies.
8. **No Andromeda toggle** — feed goals, creative breadth, and measurement; do not “turn on” retrieval.

## Epistemic status

- Primary: Meta Engineering Andromeda co-design (28 Oct 2026), GEM (13 Oct 2026), Meta Business AI ranking / matching explainers (28 Oct 2026), creative diversification guidance.
- Historical: Andromeda 2024 launch, HSNN paper (arXiv 2408.06653).
- Secondary: agency “Entity ID” studies — patterns only, not Meta APIs.
- Never claim access to production weights, feature lists, or exact similarity thresholds.
