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
| Premium | $9 | 500 | $90 | 6,000 |
| Creator | $19 | 1,000 | $190 | 12,000 |
| Pro | $29 | 1,500 | $290 | 18,000 |
| Studio | $39 | 3,000 | $390 | 36,000 |

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

The campaign currently uses a base of **80 credits per $1 contributed** plus a tier bonus that remains inside the commercial economics guard.

| Contribution | Founder Credits |
| ---: | ---: |
| $10 | 840 |
| $25 | 2,140 |
| $50 | 4,400 |
| $100 | 8,960 |
| $250 | 23,000 |
| $500 | 46,800 |
| $1,000 | 96,000 |

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
