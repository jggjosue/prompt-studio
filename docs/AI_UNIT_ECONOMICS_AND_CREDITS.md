# Prompt Studio — AI Unit Economics and Credits

## Purpose

This document is the canonical product and engineering context for Prompt Credits.

Any change to plan pricing, crowdfunding rewards, top-ups, provider routing, or AI operation costs must preserve the same unit-economics model described here. Do not create a second independent credit system.

## Prompt Credit commercial floor

Prompt Studio currently uses:

- **Commercial floor:** `$0.01 USD` per Prompt Credit.
- **Maximum provider-cost reserve:** 25% of the commercial value.
- **Platform / infrastructure reserve:** 15%.
- **Payment, refund, and risk reserve:** 10%.
- **Target minimum contribution margin:** 50% before taxes, payroll, legal/accounting, and other fixed company expenses.

Source of truth in code:

- `src/lib/credit-economics.ts`
- `src/lib/ai-credit-config.ts`
- `src/lib/ai-provider-pricing-engine.ts`

The runtime margin guard must fail closed when provider pricing is unknown or when an operation would violate the configured margin.

## Current paid plans

| Plan | Monthly price | Monthly Prompt Credits | Annual price | Annual Prompt Credits |
| --- | ---: | ---: | ---: | ---: |
| Free | $0 | 0 during crowdfunding | $0 | 0 |
| Premium | $9 | 900 | $90 | 10,800 |
| Creator | $19 | 1,900 | $190 | 22,800 |
| Pro | $29 | 2,900 | $290 | 34,800 |
| Studio | $39 | 3,900 | $390 | 46,800 |

Source: `src/lib/subscription-plans.ts`.

During the crowdfunding period, paid-plan AI credits are recorded as **pending** and are not spendable until the campaign ends and Prompt Studio activates the AI credit balance.

## Current operation pricing

The server-side operation catalog is authoritative.

| Operation | Prompt Credits |
| --- | ---: |
| Short text | 2 |
| Long text | 5 |
| Complex text | 10 |
| Image Lite 1K | 16 |
| Image Quality 1K | 31 |
| Image Quality 2K | 46 |
| Image Quality 4K | 70 |
| Video Lite 720p / 8s | 180 |
| Video Lite 1080p / 8s | 288 |
| Video Fast 720p / 8s | 360 |
| Video Fast 1080p / 8s | 432 |
| Video Premium / 8s | 1,440 |
| Simple website | 36 |
| Advanced website | 50 |
| Complex website | 100 |

Source: `src/lib/ai-operation-catalog.ts`.

Before changing these amounts, validate the real provider cost, safety buffer, and contribution margin. Do not reduce operation credits based only on competitor marketing.

## Generation flow

The economic lifecycle is:

`estimate → margin validation → reserve → execute → reconcile → capture/refund`

The system must:

1. estimate provider cost,
2. resolve the operation credit cost,
3. block the request if provider pricing is unknown or margin is insufficient,
4. reserve credits before execution,
5. reconcile against actual provider cost,
6. refund eligible failed jobs,
7. avoid double charges through idempotency.

Relevant code:

- `src/lib/runtime-operation-pricing.ts`
- `src/lib/ai-job-service.ts`
- `src/lib/generation-pricing.ts`

## Credit sources must remain separate

Prompt Studio tracks multiple balance sources because they have different lifecycle rules:

- subscription credits,
- purchased/top-up credits,
- Founder Credits,
- promotional credits.

Do not collapse them into one source in persistence even though the user sees one total balance.

This allows expiration, refunds, campaign activation, reconciliation, and analytics to remain correct.

## Top-ups

One-time top-up packs currently preserve the same commercial floor:

| Pack | Price |
| --- | ---: |
| 500 credits | $5 |
| 1,000 credits | $10 |
| 2,500 credits | $25 |
| 5,000 credits | $50 |
| 10,000 credits | $100 |

Top-ups are enabled only after crowdfunding credit activation.

Relevant files:

- `src/lib/credit-packs.ts`
- `src/app/api/credits/checkout/route.ts`

## Crowdfunding rule

Founder Credits use the **same Prompt Credit economy** as plans and top-ups. They are not a separate token.

The campaign currently uses a base of **100 credits per $1 contributed** plus a tier bonus that remains inside the commercial economics guard.

| Contribution | Founder Credits |
| ---: | ---: |
| $10 | 1,050 |
| $25 | 2,675 |
| $50 | 5,500 |
| $100 | 11,200 |
| $250 | 28,750 |
| $500 | 58,500 |
| $1,000 | 120,000 |

Custom contribution amounts use the same formula and the bonus percentage of the highest tier reached.

Founder Credits remain pending during the campaign. They become eligible after the campaign ends, payment has been received, and the backer/payment is verified. Reaching 100% of the funding goal is not required.

Relevant files:

- `src/lib/founder-credit-tiers.ts`
- `src/lib/founder-credit-fulfillment.ts`
- `src/models/CrowdfundingContribution.ts`
- `src/app/api/webhooks/stripe/route.ts`

## Financial interpretation

Do not confuse these concepts:

- **cash collected**,
- **recognized/operating profit**,
- **future credit liability**,
- **provider COGS**,
- **fixed infrastructure**.

A crowdfunding payment may generate cash immediately while the associated Founder Credits remain a future product obligation.

For planning, always model both:

- expected utilization (for example 70%), and
- 100% redemption.

Do not treat unused credits as guaranteed profit.

## Observability requirements

For every paid generation, record or derive:

- user ID,
- generation/job ID,
- operation code,
- provider and model,
- input/output usage,
- image resolution or video duration,
- estimated provider cost,
- actual provider cost when available,
- credits estimated,
- credits reserved,
- credits captured/refunded,
- source bucket,
- correlation/request ID,
- timestamps.

Contribution margin should be observable by provider, model, operation, plan, and credit source.

## Change-control checklist

Before modifying prices or credits:

1. Update the relevant source-of-truth module.
2. Recalculate price per credit.
3. Validate provider cost against the margin guard.
4. Check annual as well as monthly economics.
5. Check crowdfunding rewards and top-ups for consistency.
6. Verify Stripe amount-to-plan mapping.
7. Update public pricing/crowdfunding copy.
8. Update tests.
9. Update this document if the product rule changed.

Never hard-code a second credit table in UI code when the value can come from the central domain logic.


## Full-platform COGS audit — 2026-10-03

Prompt Credits must be evaluated against the full platform cost, not only model/API cost. The repository environment contract identifies these economic domains: AI providers; Vercel; MongoDB Atlas; Cloudflare R2 and Queues; Google Cloud Run and Cloud Tasks; Resend; Upstash Redis/QStash; Clerk; Firebase; Stripe; and optional worker/provider infrastructure.

Secrets and real environment-variable values are never part of this audit. Provider discovery uses variable names, application configuration and dependencies only.

### Two cost layers

1. **Provider COGS**: direct AI cost attributable to a generation (tokens, images, video seconds, provider tools).
2. **Platform COGS**: hosting, database, storage, queues, email, auth, payment fees, serverless compute and other shared/variable infrastructure.

The commercial price of a Prompt Credit is intentionally not equal to either layer:

```text
nominal Prompt Credit retail value = $0.0100

true COGS / credit =
  (AI provider spend
   + attributable platform usage
   + amortized shared platform spend
   + attributable payment fees)
  / Prompt Credits consumed
```

Source of truth for planning/list-price platform inputs:
- `src/lib/platform-cost-registry.ts`

Actual invoices/usage remain authoritative for realized COGS.

### Current infrastructure price references

| Provider/service | Planning input | Cost behavior |
| --- | ---: | --- |
| Vercel Pro | $20/month; $20 included usage credit | shared + metered |
| Vercel function invocation | $0.0000006/invocation | variable |
| MongoDB Atlas Flex | starts near $8/month, up to $30/month | shared/usage |
| MongoDB Atlas Dedicated | published starting equivalent ~$56.94/month | shared; configuration-sensitive |
| Cloudflare R2 Standard storage | $0.015/GB-month | variable |
| Cloudflare R2 Class A | $4.50/million | variable |
| Cloudflare R2 Class B | $0.36/million | variable |
| Cloudflare Queues | first 1M ops/month included on Workers Paid, then $0.40/million | variable |
| Resend Pro | $20/month, 50k emails | shared |
| Resend overage | $0.90/1,000 emails | variable |
| Upstash Redis PAYG | $0.20/100k commands | variable |
| Upstash QStash | planning rate $1/100k messages | variable |
| Clerk Pro | $20/month annual-billing equivalent; 50k MRU included | shared + usage |
| Clerk first MRU overage band | $0.02/retained-user-month above included threshold | usage |
| Cloud Run CPU | $0.000018/vCPU-second after free allowance | variable |
| Cloud Run memory | $0.000002/GiB-second after free allowance | variable |
| Cloud Tasks | first 1M operations free, then $0.40/million | variable |
| Firestore Standard reads (us-central1 reference) | $0.03/100k reads after applicable free quota | variable |
| Firestore Standard writes (us-central1 reference) | $0.09/100k writes after applicable free quota | variable |
| Stripe Mexico domestic cards | 3.6% + MXN 3 per successful transaction | transaction |

Prices are public list-price planning inputs verified on 2026-10-03. Currency, region, negotiated agreements, taxes, product configuration, free tiers and provider changes can alter actual invoices.

### Cost attribution policy

Do **not** charge every service literally to every AI request.

- AI token/image/video cost: attribute directly to the generation.
- R2 requests/storage: attribute when the generated asset causes the usage; amortize persistent storage over measured consumption when direct attribution is impractical.
- Queue/Redis/Cloud Tasks/Cloud Run: attribute measured job usage where telemetry exists.
- Resend: attribute only when a generation/workflow actually sends email; otherwise treat subscription base as shared platform overhead.
- MongoDB, Vercel and Clerk base plans: amortize monthly actual spend across consumed credits or, preferably, across product revenue plus credits using finance reporting. They are not per-prompt API fees.
- Stripe: allocate actual payment fees to the credit source/purchase. The fixed MXN fee makes small purchases proportionally more expensive.
- Firebase: charge only the Firebase services actually used; presence of client configuration does not prove billable Firestore usage.

### Commercial decision: keep $0.01 nominal value

The audit does **not** justify reducing the nominal Prompt Credit price. The current structure remains:

```text
$0.0100 nominal revenue / credit
$0.0025 maximum AI-provider reserve / credit
$0.0015 platform/infrastructure reserve / credit
~10% payment/refund/risk reserve
~50% target contribution margin
```

Many platform operations cost much less than the $0.0015 infrastructure reserve when amortized at meaningful volume. The reserve is intentionally broader than a single request: it must also absorb base subscriptions, database capacity, storage persistence, retries, observability and growth.

Do not increase or decrease `PROMPT_CREDIT_RETAIL_USD` from public list prices alone. Change it only when measured trailing usage shows that realized full-platform economics persist outside the guardrails.

### Price-change triggers

Review commercial pricing monthly once paid credits are active. Use trailing 30-day actual invoices and credit consumption.

- **Healthy:** true COGS <= $0.0040/credit and contribution margin >= 50%: keep $0.01.
- **Watch:** true COGS > $0.0040/credit or contribution margin < 50%: investigate provider mix, retries, infrastructure and payment mix before changing retail price.
- **Critical:** true COGS > $0.0050/credit for two consecutive complete billing periods: reprice expensive operations/provider routing first; evaluate retail credit price only after operation-level optimization.
- **Over-reserved:** true COGS < $0.0025/credit for at least three complete billing periods: do not automatically lower credit retail value. Consider more included credits, promotions, or better plan value while preserving the $0.01 anchor.

These are management guardrails, not accounting standards.

### Monthly true-cost report

Record at minimum:

```text
period
credits_consumed
credit_cash_revenue
AI_provider_spend
Vercel_spend
MongoDB_spend
Cloudflare_spend
Google_Cloud_spend
Resend_spend
Upstash_spend
Clerk_spend
Firebase_spend
Stripe_fees
other_platform_spend
true_cost_per_credit
contribution_per_credit
contribution_margin_percent
```

Calculate:

```text
platform_spend = sum(non-AI infrastructure)
total_COGS = AI_provider_spend + platform_spend + attributable_payment_fees
true_cost_per_credit = total_COGS / credits_consumed
contribution = credit_cash_revenue - total_COGS
contribution_margin = contribution / credit_cash_revenue
```

Track both 100% credit redemption and observed utilization. Unused credits are not guaranteed profit.

### Public pricing sources reviewed

Re-verify before every financial change:
- Vercel pricing: https://vercel.com/pricing
- MongoDB Atlas pricing: https://www.mongodb.com/pricing
- Cloudflare R2: https://developers.cloudflare.com/r2/pricing/
- Cloudflare Queues: https://developers.cloudflare.com/queues/platform/pricing/
- Resend: https://resend.com/pricing
- Upstash: https://upstash.com/pricing
- Clerk: https://clerk.com/pricing
- Stripe Mexico: https://stripe.com/mx/pricing
- Cloud Run: https://cloud.google.com/run/pricing
- Cloud Tasks: https://cloud.google.com/tasks/pricing
- Firebase / Firestore: https://firebase.google.com/pricing
- Gemini Developer API: https://ai.google.dev/gemini-api/docs/pricing
- OpenAI API models/pricing: https://developers.openai.com/api/docs/models

### Change-control extension

Any future Prompt Credit audit must review **both** provider AI pricing and platform COGS. A model becoming cheaper is not sufficient reason to make credits cheaper if infrastructure/payment costs rise, and a hosting bill increase is not sufficient reason to raise every AI operation if the increase is fixed and well amortized.

When actual billing integrations become available, replace planning assumptions with invoice/usage telemetry while retaining the registry as a documented benchmark and anomaly detector.
