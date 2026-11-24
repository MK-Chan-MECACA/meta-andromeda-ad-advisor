# Page Override: Home (Intake + Results)

> Overrides `MASTER.md` for the Andromeda single-page advisor.

## Intent
Diagnostic tool UI — not a marketing landing page. Prioritize clarity, progressive disclosure, and dark cinema atmosphere. Voice: 2026 Retrieval MoE gatekeeper (“I score every eligible ad”).

## Layout
- Compact hero: brand chip + ANDROMEDA + one supporting line (MoE / eligible-ad framing)
- Glass intake shell with 4-step wizard (Assets → Copy → Setup → Metrics)
- Results appear below after analyze; auto-scroll to verdict
- Results include pipeline strip (Eligibility → Retrieval MoE → Ranking → Auction → Learning), 2026 signal cards (eligibility breadth, expert coverage, semantic clarity, cold-start), and collapsed sources

## Color (dark primary)
| Role | Hex |
|------|-----|
| Background | `#060a12` |
| Surface | `#0b1220` / glass |
| Primary | `#2563eb` |
| Accent/CTA | `#d97706` |
| Pass / Warn / Danger | `#22c55e` / `#d97706` / `#ef4444` |

## UX rules
- Show one intake step at a time; allow jump via step tabs
- Progress bar + “Step N of 4”
- Labels always visible (never placeholder-only)
- Loading: spinner + skeleton lines (>300ms feedback)
- CTA uses amber accent; 48px min touch height
- Focus rings on all interactive controls
- Respect `prefers-reduced-motion`

## Anti-patterns
- Dumping all form fields at once
- Purple AI gradients
- Emoji icons
- Silent submit / frozen UI while analyzing
