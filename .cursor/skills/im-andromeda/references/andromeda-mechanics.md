# Andromeda mechanics (reference)

Load this when the user wants technical depth or when a diagnosis hinges on hierarchy / distillation / auction math.

## What Andromeda is

Meta's personalized **ads retrieval** engine (announced Engineering at Meta, Dec 2, 2024). Stage 1 of the cascade:

**Eligibility → Andromeda retrieval → Lattice ranking → Auction**

Job: tens of millions of eligible ads → a few thousand candidates. Reported: ~10,000× retrieval model capacity, +6% recall, +8% ads quality (selected segments), >3× inference QPS. Hardware: NVIDIA Grace Hopper + Meta MTIA co-design.

## Why hierarchy

Full DNN scoring of every ad every request is impossible in ~200–300ms. Solution: **Hierarchical Structured Neural Network (HSNN)** (Meta paper arXiv 2408.06653) — jointly trained index + Modular Neural Networks (MoNN).

### MoNN towers

- **User tower** — once per request (can be large)
- **Item tower** — async on ad updates; embeddings near GPU memory
- **Interaction tower** — ⟨user, item⟩ features via inverted-index I2IF
- **OverArch** — DHEN-style deep interactions → click/conversion logits

Trained multi-task (click + conversion), online snapshots, distillation from stronger models.

### Index layers (advertiser translation)

| Layer | Granularity | Advertiser meaning |
|-------|-------------|--------------------|
| L1 | Coarse topic/intent | Branch of the creative tree |
| L2 | Sub-cluster / angle | Distinct concept (persona/format/benefit) |
| L3 | Individual ad | Exact asset inside a concept |

Cost is sub-linear: expensive models on coarse nodes; cheap models on surviving ads.

**Entity ID (industry term):** semantically similar creatives share retrieval paths / tickets. Not an official Ads Manager field.

## Rest of the stack

| System | Role |
|--------|------|
| **GEM** | LLM-scale teacher; knowledge-distills into retrieval/ranking students |
| **Lattice** | Unified ranking across surfaces/objectives |
| **Sequence learning** | Order of actions in the purchase journey |
| **Auction** | Total Value = (Bid × EAR) + Ad Quality |

## Advertiser implications

1. Broad targeting + Advantage+ often beats stacked interests/LALs once conversion history exists.
2. True creative diversity (Format × Persona × Environment × Benefit) multiplies retrieval tickets.
3. Fake diversity collapses under hierarchical clustering.
4. Signal quality (Pixel + CAPI, EMQ ≥ 7) trains EAR.
5. Learning: ~50 optimization events / 7 days; `daily budget ≈ (CPA × 50) / 7`.
6. Fatigue accelerates because micro-audiences per concept saturate faster — refresh concepts, not crops.

## Epistemic status

- Primary: Meta Engineering Andromeda (2024), Meta for Business AI ranking (2025), GEM engineering (2025), HSNN paper.
- Secondary: agency "Entity ID" / Confect-style studies — useful patterns, not Meta-official APIs.
- Never claim access to production weights, feature lists, or exact similarity thresholds.
