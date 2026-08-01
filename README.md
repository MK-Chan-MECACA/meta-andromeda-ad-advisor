# Andromeda — Meta Ad Advisor

Single-session dashboard that diagnoses Meta/Facebook/Instagram ads the way **Andromeda retrieval** would: upload creative, paste copy, or drop an Ads Manager screenshot, then get a verdict, scorecard, what worked / failed, and prioritized conversion fixes.

Powered by **xAI Grok** (`grok-4.5`) via the Vercel AI SDK.

## Setup

```bash
npm install
cp .env.example .env.local
```

Add your key to `.env.local`:

```bash
XAI_API_KEY=xai-...
```

Get a key from [console.x.ai](https://console.x.ai/).

## Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How to use

1. Drop creative images and/or Ads Manager screenshots (max 3 images, 4MB each).
2. Paste primary text, headline, description, CTA.
3. Fill setup (objective, targeting, budget…) and optional live metrics.
4. Click **Analyze as Andromeda**.

Without live metrics, live performance is marked **Unknown** — the advisor will not invent ROAS success.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- `ai` + `@ai-sdk/xai` + Zod structured output
- Analysis prompt distilled from `.cursor/skills/im-andromeda`
