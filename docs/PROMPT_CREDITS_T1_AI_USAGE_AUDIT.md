# Prompt Credits v1 — T1 AI usage audit

Parent: #871  
Base branch: `main`  
Scope: re-audit plus pricing consistency corrections on `main`; generation execution behavior is otherwise unchanged.

## 2026-10-03 re-audit — main branch commercial surfaces and provider pricing

This re-audit uses **`main` as the sole repository source of truth**. It validates the public pricing page, subscription catalog, Founder/crowdfunding calculator, dashboard top-ups, tests, and provider-cost registry.

### Canonical Prompt Studio commercial pricing

| Plan | Monthly price | Monthly Prompt Credits | Annual price | Annual Prompt Credits |
|---|---:|---:|---:|---:|
| Free | $0 | 0 | $0 | 0 |
| Premium | $9 | 500 | $90 | 6,000 |
| Creator | $19 | 1,000 | $190 | 12,000 |
| Pro | $29 | 1,500 | $290 | 18,000 |
| Studio | $39 | 3,000 | $390 | 36,000 |

These values are enforced by `tests/unit/pro-plan.test.ts` and `tests/unit/premium-monthly-credits.test.ts`. The implementation in `src/lib/subscription-plans.ts` was corrected on `main` to match that contract. `/prices` already reads prices and credits from that shared module instead of maintaining an independent price table.

### Founder Program / crowdfunding

Founder Credits use a campaign-specific conversion of **80 base credits per $1**, followed by the tier bonus:

| Contribution | Base | Bonus | Total Founder Credits |
|---|---:|---:|---:|
| $10 | 800 | 5% / 40 | 840 |
| $25 | 2,000 | 7% / 140 | 2,140 |
| $50 | 4,000 | 10% / 400 | 4,400 |
| $100 | 8,000 | 12% / 960 | 8,960 |
| $250 | 20,000 | 15% / 3,000 | 23,000 |
| $500 | 40,000 | 17% / 6,800 | 46,800 |
| $1,000 | 80,000 | 20% / 16,000 | 96,000 |

This contract is visible on `/crowdfunding` and enforced by `tests/unit/crowdfunding-credit-calculator.test.ts`. `src/lib/founder-credit-tiers.ts` was corrected on `main` from the divergent 100 credits/$1 implementation back to 80 credits/$1.

### Dashboard / one-time top-ups

The active top-up catalog is:

| Price | Credits |
|---:|---:|
| $5 | 500 |
| $10 | 1,000 |
| $25 | 2,500 |
| $50 | 5,000 |
| $100 | 10,000 |

There is **no active bonus** on these five top-ups. `tests/unit/prompt-credit-packages-v1.test.ts` requires those exact price/credit pairs and `tests/unit/credit-topup.test.ts` requires every pack to remain at or above the $0.01/credit floor. `src/lib/credit-packs.ts` was corrected on `main` to match the tested contract. The dashboard obtains its list from `/api/credits`, which obtains it from `CREDIT_PACKS`, so it does not need a second hard-coded table.

### Provider pricing audit

Provider cost remains separate from the commercial Prompt Credit catalog. It is an internal routing/margin input.

#### Google Gemini Developer API

Official source: https://ai.google.dev/gemini-api/docs/pricing

Verified current examples:
- Gemini 2.5 Flash standard: $0.30 / 1M text-image-video input tokens and $2.50 / 1M output tokens.
- Gemini 2.5 Flash-Lite standard: $0.10 / 1M text-image-video input tokens and $0.40 / 1M output tokens.
- Gemini 3.x pricing includes processing tiers and, for some models, rates that change on 2027-01-01.

The current `gemini-2.5-flash` registry entry matches the official standard token price. Model IDs and image/video prices still require model-specific verification before being marked verified.

#### Google Cloud / Vertex AI

Google Cloud/Vertex must be represented separately from the Gemini Developer API because processing location/tier and product surface can change the billable rate.

Official source: https://cloud.google.com/vertex-ai/generative-ai/pricing

Do not copy a Gemini Developer API rate into a Vertex/Cloud provider record solely because the model family has the same name. Store provider surface, processing tier/region, effective date and source URL with each verified price.

#### OpenAI API

Official source: https://developers.openai.com/api/docs/pricing

Current official examples include:
- GPT-5.4: $2.50 / 1M input, $0.25 cached input, $15.00 / 1M output.
- GPT-5.4 Mini: $0.75 / 1M input, $0.075 cached input, $4.50 / 1M output.
- GPT-5.4 Nano: $0.20 / 1M input, $0.02 cached input, $1.25 / 1M output.

The repository's `openai:gpt-4o` entry remains explicitly `legacy-estimate`. It must not be promoted to `verified` or used for a margin guarantee without re-verifying that exact model and processing tier.

#### ChatGPT subscriptions

Official sources:
- https://chatgpt.com/pricing
- https://openai.com/business/pricing/

ChatGPT plan prices are competitive/product context only. They are **not OpenAI API unit costs** and must never feed `estimateProviderCost()` or Prompt Credit margin calculations.

### Single source of truth implemented

The audit is now applied to runtime code through `src/lib/commercial-pricing.ts`.

- `SUBSCRIPTION_CATALOG` owns paid plan prices and included monthly credits.
- `FOUNDER_BASE_CREDITS_PER_USD` and `FOUNDER_REWARD_CATALOG` own crowdfunding conversion and tier bonuses.
- `ACTIVE_CREDIT_PACK_CATALOG` owns dashboard/top-up price and credit quantities.
- `subscription-plans.ts`, `founder-credit-tiers.ts`, `credit-packs.ts`, `stripe-checkout.ts`, the crowdfunding calculator, `/prices`, `/crowdfunding`, and the dashboard credits API now consume that chain instead of maintaining independent commercial numeric tables.
- `tests/unit/commercial-pricing-catalog.test.ts` protects the catalog and integration boundaries from future drift.

Provider/API unit costs remain intentionally outside this commercial catalog because they are operational costs, not customer-facing Prompt Credit SKUs.

### Main-branch correction status

Corrected in this re-audit:
1. `subscription-plans.ts`: restored tested monthly/annual Prompt Credit allowances.
2. `founder-credit-tiers.ts`: restored 80 base Founder Credits per $1.
3. `credit-packs.ts`: restored exact active top-up amounts with no bonus.
4. `PROMPT_CREDITS_T1_AI_USAGE_AUDIT.md`: changed audit base to `main` and reconciled commercial/provider pricing.

Still intentionally separated:
- commercial Prompt Credit prices,
- Founder campaign rewards,
- provider/API cost,
- ChatGPT subscription pricing.

No provider price should be treated as permanent: verified provider records should carry an effective date/source and be revalidated when providers change pricing.


## Executive summary

Prompt Studio already has a substantial credit and generation foundation. T2–T6 should **extend and normalize the existing system**, not create a parallel wallet, ledger, job system, provider catalog, or billing database.

Verified foundations on `main`:

- Next.js 15 / React 19 application with server routes under `src/app/api`.
- MongoDB via Mongoose.
- Clerk authentication/billing helpers.
- Stripe SDK and existing credit top-up/purchase code.
- Genkit plus Google GenAI SDKs.
- Canonical AI job APIs under `src/app/api/ai/jobs`.
- Existing `AIGenerationJob`, `AICreditAccount`, and `AICreditLedger` models.
- Existing reserve/capture/reconcile/refund implementation in `src/lib/ai-job-service.ts`.
- Existing server-owned model/cost configuration in `src/lib/ai-credit-config.ts`.
- Existing credit packs/top-up implementation.
- Existing GCP/queue migration architecture and provider-cost telemetry work.

The previous forced 100,000-credit development hack is no longer present in `src/lib/ai-job-service.ts` on `main`; the re-audit verified that stale finding should not remain a current release blocker.

## Current architecture

### Authentication and commerce

| Concern | Current implementation |
|---|---|
| Authentication | Clerk / `@clerk/nextjs`; server helpers include `src/lib/api-auth.ts` and Clerk billing helpers |
| Payments | Stripe SDK; credit pack/top-up modules already exist |
| Database | MongoDB / Mongoose |
| Generated asset storage | Cloudflare R2 integration exists |
| Web runtime | Next.js on Vercel |
| Heavy async target | GCP managed queue + Cloud Run workers per existing migration docs/issues |

### Existing credit domain

#### `src/models/AICreditAccount.ts`
Existing account/balance model. The current service uses:
- total balance
- subscription balance
- purchased balance
- reserved totals
- reserved subscription/purchased amounts
- lifetime spent

This is the model T2 should evolve into credit buckets/sources; do not introduce a second wallet collection without a migration reason.

#### `src/models/AICreditLedger.ts`
Existing ledger used for reservation/capture/refund records and generation/provider metadata. T2 should preserve its immutable-ledger role and extend source/type semantics for MONTHLY, PURCHASED, FOUNDER, PROMOTIONAL and REFUND.

#### `src/models/AIGenerationJob.ts`
Existing canonical generation job model. Credit state and provider/model/cost data already flow through this job. T3–T6 should attach operation codes and pricing snapshots to this model instead of creating another generation-job system.

#### `src/models/CreditPurchase.ts`
Existing one-time credit purchase persistence. T19 should reuse it or explicitly migrate it.

### Existing credit service

`src/lib/ai-job-service.ts` already implements the core lifecycle:

```text
ensure account
  -> reserve credits atomically
  -> execute generation
  -> reconcile/capture actual usage
  -> refund/release on eligible failure
  -> append ledger records
```

Observed protections:
- MongoDB sessions/transactions
- idempotency checks by job/operation
- optimistic/concurrency checks
- separate subscription/purchased consumption
- reservation state on the generation job
- provider/model/cost telemetry on ledger entries

This is the primary implementation to extend for T5/T6 and #146/#836.

### Resolved historical finding: forced development balance

The earlier audit documented an unconditional 100,000-credit development override in `ensureCreditAccount()`. The current `main` version of `src/lib/ai-job-service.ts` no longer contains that override. Keep regression coverage around authoritative balances so a development shortcut cannot re-enter production paths.

## Existing provider/model pricing layer

`src/lib/ai-credit-config.ts` is already a server-owned provider/model allowlist and estimator.

Current configured provider families include:
- Google
- OpenAI
- Anthropic
- fal

Current categories include:
- text
- project
- image
- video
- vision

It already stores several of the fields planned for Prompt Credits:
- provider
- model ID
- category
- minimum credits
- input/output token prices
- image price
- video price per second
- token/input limits
- max credits
- enabled state
- pricing verification status

It also provides:
- model lookup/allowlisting
- default model resolution
- token estimation
- API cost estimation
- credit estimation
- subscription/purchased split logic

### Gap versus Prompt Credits v1

The current configuration is **model-centric**. Prompt Credits v1 needs an **operation-centric catalog** above it.

Example:

```text
VIDEO_FAST_720_8S
        |
        +--> Google/Veo model A
        +--> future OpenAI model B
        +--> future provider C
```

Users should buy an operation/quality tier in Prompt Credits; provider routing remains internal.

T3 should therefore evolve this code rather than discard it.

## Verified AI entry points

### Canonical AI job API

`src/app/api/ai/jobs` contains:

| Route | Role |
|---|---|
| `jobs/route.ts` | job submission/list entry point |
| `jobs/[id]/route.ts` | job status/details |
| `jobs/[id]/asset/route.ts` | generated asset |
| `jobs/[id]/cancel/route.ts` | cancellation |
| `jobs/[id]/retry/route.ts` | retry |
| `jobs/[id]/progress/route.ts` | progress |
| `jobs/process/route.ts` | processing/worker path |
| `jobs/sweep/route.ts` | stuck/recovery sweep |

Provider recommendation already has `src/app/api/ai/providers/recommend/route.ts`.

These endpoints are the preferred integration boundary for image/video/web jobs. Prompt Credits should not add a second public generation API when the existing job API can be extended.

### Genkit flows

Verified flows under `src/ai/flows`:

| Flow | Prompt Credits operation family |
|---|---|
| `generate-text.ts` | TEXT_SHORT / TEXT_LONG / TEXT_COMPLEX |
| `optimize-prompt.ts` | PROMPT_OPTIMIZER_BASIC / ADVANCED / COMPLEX |
| `generate-image.ts` | IMAGE_* |
| `generate-image-video-prompts.ts` | prompt-generation helper; determine whether user-billable or internal cost |
| `generate-video-understanding.ts` | video understanding; needs explicit product billing decision |
| `generate-vision.ts` | vision analysis; needs explicit product billing decision |
| `personalize-component.ts` | COMPONENT_AI_MODIFICATION / generation depending caller |
| `prompt-goals.ts` | helper; determine whether directly provider-backed |

Genkit is initialized in `src/ai/genkit.ts`.

### Product AI services

Verified cost-bearing or potentially cost-bearing services include:

- `src/lib/code-audit.ts` — Code Auditor
- `src/lib/ai-edit.ts` — AI editing
- `src/lib/ai-site-plan.ts` — site planning
- `src/lib/editor/ai-edit-ops.ts` — editor AI operations
- `src/lib/editor/ai-edit-planner.ts` — editor AI planning
- `src/lib/editor/ai-site-planner.ts` — website/site planning
- `src/lib/ai-job-runner.ts` — generation execution/provider dispatch
- `src/lib/ai-job-service.ts` — generation persistence + credit lifecycle
- `src/lib/batch-generation.ts` — batch generation orchestration

Relevant user surfaces verified from the application tree include:
- Code Auditor
- Component Builder/visualization surfaces
- Dashboard credits
- AI generation/chat surfaces
- Website/editor surfaces

## Prompt Credits operation map

The following is the T1 canonical operation map to implement in T3. Names are stable product operation codes; provider/model is deliberately not encoded in the user-facing credit identity.

| Product capability | Operation code(s) | Initial credits | Existing integration anchor |
|---|---|---:|---|
| Text generation | `TEXT_SHORT`, `TEXT_LONG`, `TEXT_COMPLEX` | 2 / 5 / 10 | Genkit `generate-text.ts` |
| Prompt optimizer | `PROMPT_OPTIMIZER_BASIC`, `PROMPT_OPTIMIZER_ADVANCED`, `PROMPT_OPTIMIZER_COMPLEX` | 2 / 5 / 8 | Genkit `optimize-prompt.ts` |
| Image generation | `IMAGE_LITE_1K`, `IMAGE_QUALITY_1K`, `IMAGE_QUALITY_2K`, `IMAGE_QUALITY_4K` | 15 / 30 / 45 / 70 | AI job API + runner; Genkit image flow exists |
| Video generation | `VIDEO_LITE_720_8S`, `VIDEO_LITE_1080_8S`, `VIDEO_FAST_720_8S`, `VIDEO_FAST_1080_8S`, `VIDEO_PREMIUM_8S` | 180 / 285 / 360 / 430 / 1425 | AI job API + async runner/worker architecture |
| Website generation | `WEBSITE_SIMPLE`, `WEBSITE_ADVANCED`, `WEBSITE_COMPLEX` | 20 / 50 / 100 | AI site planning/editor + generation job architecture |
| AI website editing | `WEBSITE_AI_EDIT_SMALL`, `WEBSITE_AI_EDIT_SECTION`, `WEBSITE_AI_EDIT_COMPLEX`, `WEBSITE_AI_REDESIGN` | 5 / 10 / 25 / 50 | `ai-edit.ts`, editor AI modules |
| Code Auditor | `CODE_AUDIT_SMALL`, `CODE_AUDIT_STANDARD`, `CODE_AUDIT_ADVANCED`, `CODE_AUDIT_PROJECT` | 5 / 15 / 30 / 50–100+ | `code-audit.ts` + Code Auditor UI |
| Component preview | `COMPONENT_PREVIEW` | FREE | component rendering/visualization; must never invoke billing by itself |
| Component AI analysis | `COMPONENT_AI_ANALYSIS` | 3 | component AI flow/service to normalize in T14 |
| Component AI modification | `COMPONENT_AI_MODIFICATION` | 5 | `personalize-component.ts` / component builder |
| Component AI generation | `COMPONENT_AI_GENERATION` | 10 | component builder/AI flow |

### Operations requiring a product decision

The repository also contains provider-backed helper/analysis capabilities not yet represented in the agreed public pricing table:
- video understanding
- generic vision analysis
- image/video prompt generation
- site-planning substeps
- internal retries/recovery/reconciliation

T3 must classify each as one of:
1. a separately billable operation,
2. included internal work inside a parent operation,
3. free/non-provider action.

Internal substeps and retries must **not** independently charge a user when they are part of one paid parent generation.

## Auth, rate limiting, retries and failure behavior

### Authentication
AI APIs should continue using existing Clerk/server auth helpers. T7–T14 must not create feature-specific trust in client user IDs or balances.

### Retries/idempotency
The existing generation architecture and issues #785/#786/#836 already define:
- stable generation-level idempotency
- atomic job claim
- typed retry policy
- dead-letter/recovery
- exactly-once credit reconciliation

Prompt Credits must reuse those contracts.

### Rate limiting
T1 found existing API/auth and generation controls, but rate limiting is not represented as one single authoritative credit-layer primitive. T25 should verify every cost-bearing route cannot bypass both credit authorization and abuse controls.

### Failure/refund
The existing service already has reserve/capture/refund semantics. T6 should make this the mandatory path for every paid AI operation rather than implementing local deductions in individual feature handlers.

## Existing billing and credit UI

Verified existing surfaces/modules:
- `src/app/[locale]/dashboard/credits/credits-client.tsx`
- `src/app/[locale]/dashboard/credits/page.tsx`
- `src/lib/credit-packs.ts`
- `src/lib/credit-topup.ts`
- `src/models/CreditPurchase.ts`
- `src/app/api/credits` API namespace

T15–T19 should reuse these rather than creating a second credits dashboard or top-up flow.

## T2–T6 implementation map

### T2 — data model
Extend:
- `AICreditAccount`
- `AICreditLedger`
- `AIGenerationJob`
- `CreditPurchase`

Add new persistence only where no current model can safely express:
- credit source buckets/allocations with expiration
- operation catalog/pricing snapshots if database-backed administration is required
- provider pricing history
- Founder/crowdfunding claims

Mandatory T2 action: remove or strictly development-gate the 100,000-credit hack.

### T3 — operation catalog
Build an operation layer above `ai-credit-config.ts`.
Do not make provider/model IDs the commercial SKU.
Store/resolve one authoritative operation credit price server-side.

### T4 — provider pricing
Reuse/evolve `AI_MODEL_CONFIG` and current cost estimator.
Separate:
- user-facing operation credit price
- provider/model cost
- pricing verification/effective date
- routing eligibility
- margin/safety calculations

### T5 — wallet
Refactor/extend `ai-job-service.ts` and existing account/ledger models.
Do not create a competing wallet service unless the old functions are migrated atomically and callers are updated.

### T6 — reservation workflow
Make existing reserve/reconcile/refund path mandatory for every paid operation.
Reuse #146/#836 and canonical `AIGenerationJob` idempotency.

## Risks to address before production Prompt Credits

1. **Resolved historical risk — forced 100,000-credit update.** Not present in current `main`; retain regression coverage.
2. **High — model-centric pricing vs operation-centric product pricing.** Current estimator cannot by itself express the agreed Prompt Studio SKU/quality catalog.
3. **High — unverified/legacy provider prices.** Several configured provider/model prices are explicitly marked `unverified` or `legacy-estimate`; do not use them as financial truth for margin guarantees.
4. **High — helper AI calls can cause hidden cost.** Site planning, prompt helpers, vision/video understanding and retries need parent-operation attribution so users are not double charged while Magzin still measures cost.
5. **High — multiple AI surfaces.** All cost-bearing paths must converge on one server-authoritative pricing/reservation boundary; direct Genkit/provider calls must not become credit bypasses.
6. **Medium — current balance taxonomy is subscription/purchased only.** Founder, promotional, expiration and refund semantics need an explicit migration design.
7. **Medium — variable-duration video.** 8-second presets are commercial presets, not a sufficient storage/calculation model for all future video durations.
8. **Medium — large Code Auditor workloads.** Fixed project pricing must be capped/estimated before provider execution.

## Acceptance result for T1

T1 is complete when this document is merged because it:

- identifies the current framework/database/auth/payment/AI stack,
- identifies the existing credit account, ledger, purchase and generation job models,
- identifies the existing pricing and reserve/capture/refund services,
- inventories the verified AI flow/service/API families,
- maps agreed Prompt Studio features to stable Prompt Credit operation codes,
- identifies which existing infrastructure T2–T6 must extend,
- verifies the historical forced-balance hack is absent from current `main`,
- separates provider/model pricing from future operation-level Prompt Credit pricing.

This re-audit also corrected commercial pricing constants on `main`; provider routing and database schema were not changed.
