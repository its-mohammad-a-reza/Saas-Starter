# Acme Support — AI Customer Support SaaS

A full-stack customer support SaaS built with Next.js 14, Claude (Anthropic), Prisma, and Stripe.

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| AI | Claude claude-sonnet-4-20250514 via Anthropic SDK |
| Database | PostgreSQL + Prisma ORM |
| Auth | Clerk |
| Billing | Stripe |
| Deployment | Vercel |

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── chat/route.ts              ← Streaming Claude responses + DB persist
│   │   └── billing/
│   │       ├── checkout/route.ts      ← Stripe Checkout session
│   │       ├── webhook/route.ts       ← Stripe event handler
│   │       └── portal/route.ts        ← Stripe billing portal
│   ├── (dashboard)/
│   │   ├── inbox/page.tsx             ← Agent dashboard
│   │   ├── billing/page.tsx           ← Plan management + usage
│   │   └── settings/page.tsx          ← Bot config
│   └── (widget)/
│       └── chat/page.tsx              ← Widget preview
├── components/
│   ├── chat/ChatWidget.jsx            ← Floating chat UI
│   └── dashboard/AgentDashboard.jsx  ← Agent inbox
├── lib/
│   ├── anthropic.ts                   ← Anthropic client + prompt builder
│   ├── db.ts                          ← Prisma singleton
│   └── stripe.ts                      ← Stripe client + plan config
├── prisma/schema.prisma               ← DB schema
└── public/widget.js                   ← Drop-in embed script
```

## Quick Start

### 1. Clone & install

```bash
git clone <your-repo>
cd acme-support-saas
npm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
# Fill in all values in .env.local
```

### 3. Database

```bash
# Start Postgres (or use Supabase / Neon)
npm run db:migrate
npm run db:generate
```

### 4. Stripe setup

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Forward webhooks to local dev
npm run stripe:listen
# Copy the webhook secret printed → STRIPE_WEBHOOK_SECRET in .env.local

# Create products in Stripe dashboard, copy Price IDs to .env.local
```

### 5. Run dev server

```bash
npm run dev
# Open http://localhost:3000
```

## Embeddable Widget

Drop this into any customer website:

```html
<script
  src="https://yourdomain.com/widget.js"
  data-key="YOUR_ORG_API_KEY"
  data-bot-name="Aria"
  data-color="#6366f1"
></script>
```

## Token Usage & Billing

- Token usage is tracked per organization on every Claude API call
- Monthly usage resets automatically via `invoice.payment_succeeded` webhook
- Conversations are auto-escalated when Claude offers human handoff
- Rate limit: 429 returned when `monthlyTokenUsage >= tokenLimit`

## Deploying to Vercel

```bash
vercel deploy

# Add environment variables in Vercel dashboard
# Update STRIPE_WEBHOOK_SECRET with production webhook endpoint
```
