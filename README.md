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

## SaaS setup

### Billing (Stripe, MYR)

1. In Stripe, create product **Andromeda Pro** with two recurring prices in **MYR**: RM 99 / month and RM 990 / year.
2. Enable the **Customer Portal** (Settings → Billing → Customer portal): payment method update, invoice history, cancellation.
3. Checkout offers **card** only: FPX and GrabPay can't be used for recurring subscription charges in Stripe.

```bash
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO_MONTHLY=price_...   # RM 99 / month
STRIPE_PRICE_PRO_YEARLY=price_...    # RM 990 / year
```

### Webhooks

| Endpoint | Source | Events |
| --- | --- | --- |
| `/api/webhooks/stripe` | Stripe → Developers → Webhooks (secret → `STRIPE_WEBHOOK_SECRET`) | `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed` |
| `/api/webhooks/clerk` | Clerk → Webhooks (signing secret → `CLERK_WEBHOOK_SIGNING_SECRET`) | `organization.created`, `organization.deleted`, `user.deleted` |

```bash
CLERK_WEBHOOK_SIGNING_SECRET=whsec_...
BLOB_READ_WRITE_TOKEN=               # set by Vercel when a Blob store is connected; used to delete a workspace's thumbnails
```

Local testing: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.

Only workspace admins see **Upgrade** / **Manage billing**. Plan changes update the Clerk organization's max memberships (Free 1, Pro 5). Deleting a workspace hard-deletes its analyses, Meta connection, subscription row and Blob thumbnails, and cancels its Stripe subscription.

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

## Import live ads from Meta

**Connect Meta** on the dashboard runs Facebook Login for Business, then lets you pick an ad account, browse its ads, and import one — creative image, copy, campaign/ad set setup, and last-7-day metrics — into the intake form. Manual upload still works unchanged.

### Meta app checklist (developers.facebook.com)

1. App type **Business** (an existing Business app works).
2. Add products **Facebook Login for Business** + **Marketing API**.
3. Valid OAuth Redirect URIs:
   - `http://localhost:3000/api/meta/callback`
   - `http://localhost:3001/api/meta/callback`
   - `https://meta-andromeda-ad-advisor.vercel.app/api/meta/callback`
   - `https://andromeda.mecaca.global/api/meta/callback` (custom domain, if used)
4. Login for Business → **Configurations** → new config: *User access token*, asset *Ad accounts*, permissions `ads_read` + `business_management`. Copy the **Configuration ID**.
5. Add your Meta user under **App roles** (Admin/Developer/Tester) — in Development mode only roled users can log in.

### Env

```bash
META_APP_ID=
META_APP_SECRET=
META_CONFIG_ID=          # Login for Business configuration ID
META_REDIRECT_URI=       # optional; defaults to <origin>/api/meta/callback
META_TOKEN_KEY=          # openssl rand -base64 32 (encrypts stored tokens)
GRAPH_API_VERSION=v25.0
```

Set the same vars in Vercel (Project → Settings → Environment Variables) and redeploy.

One Meta connection per workspace: an admin connects, every member imports. The long-lived token is stored AES-256-GCM-encrypted in `meta_connections` (see SaaS setup below).

Routes: `/api/meta/{login,callback,status,accounts,ads,ad/<id>}` + `POST /api/meta/disconnect` ([app/api/meta/[...path]/route.ts](app/api/meta/%5B...path%5D/route.ts)), helpers in [lib/meta.ts](lib/meta.ts).

### Production note

In Development mode this works for users with an app role. Serving other advertisers needs App Review: Advanced Access for `ads_read` / `business_management` plus the Marketing API access tier.

## Meta Developer Tools MCP

This repo is wired to Meta’s official remote [Developer Tools MCP](https://developers.facebook.com/documentation/mcp/devtools-mcp) so Cursor can inspect apps, search docs, check compliance/App Review, and manage webhooks while you build Meta integrations.

Config: [`.cursor/mcp.json`](.cursor/mcp.json) → server **Meta Developer Tools** → `https://mcp.facebook.com/devtools`  
Workflow skills (from [facebook/agentic-tools](https://github.com/facebook/agentic-tools)): `api-integration`, `webhook-setup`, `debug-webhooks`, `app-health-check`, `app-review-prep`, `compliance-check`, `api-health`, `search-docs`

### Connect (one-time)

1. Reload Cursor (or open **Settings → Tools & Integrations / MCP**) and confirm **Meta Developer Tools** appears.
2. Click **Needs login / Connect** and complete Meta OAuth in the browser.
3. On the consent screen, grant access to the apps you need.
   - Prefer **Read** for inspection and docs.
   - Use **Manage** only when you need to create/update/delete webhook subscriptions.
4. Verify: ask the agent to list MCP tools, then run a low-risk `devtools_app_list` (or “list my Meta apps”).

No App ID or App Secret goes in the MCP config — auth is OAuth only.

### Limits

- Almost all tools are **read-only**. The only write path is webhook subscription manage (`Manage` scope).
- Creating a **new** Meta app still happens in the [Meta for Developers](https://developers.facebook.com/) dashboard; use the MCP afterward to configure and build on it.
- The server is in **beta**. If you see “this app isn't available”, your account may not have access yet.

### Example prompts

- “Search Meta docs for WhatsApp Cloud API setup”
- “Help me start an Instagram Graph API integration”
- “Health-check app `{app_id}`”
- “Set up webhooks for … on app `{app_id}`”
- “Check compliance / App Review readiness for …”

## SaaS setup

### Meta connection per workspace (phase 4)

- **Env:** `META_TOKEN_KEY` — 32-byte AES-256-GCM key for Meta tokens stored in `meta_connections`. Generate with `openssl rand -base64 32`. Rotating it invalidates stored tokens; admins then reconnect. `SESSION_SECRET` is no longer used (OAuth `state` is signed with `META_APP_SECRET` and bound to the admin + workspace).
- **Meta app → Facebook Login for Business → Settings:** Valid OAuth Redirect URI `https://<domain>/api/meta/callback`.
- **Meta app → Settings → Basic:** Data Deletion Callback URL `https://<domain>/api/meta/deletion` (deletes every workspace connection made by that Facebook user).
- **Roles:** only workspace admins (`org:admin`) can connect/disconnect; all members can list ad accounts/ads and import. Expired or revoked tokens return 401 "reconnect Meta (ask a workspace admin)".
- **Beta:** until App Review passes, only users with a role on the Meta app (Admin/Developer/Tester) can connect. Meta enforces this; the panel shows a Beta badge.
