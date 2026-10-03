# Prompt Credits v1 — T1 AI usage audit

Parent: #871  
Base branch: `develop`  
Scope: inventory/documentation only. No runtime credit or generation behavior is changed by T1.

## 2026-10-03 re-audit — commercial surfaces and provider pricing

This re-audit closes gaps left by the original T1 inventory. It explicitly validates the public `/prices` surface, Founder Credits/crowdfunding, dashboard top-ups, subscription credit allowances, and current provider pricing references.

### Canonical Prompt Studio commercial pricing

For planning and documentation, use the current commercial model below as the canonical target until the runtime/catalog migration is completed:

| Plan | Price / month | Prompt Credits / month | Effective credits per $1 |
|---|---:|---:|---:|
| Free | $0 | 1 initial | n/a |
| Premium | $9 | 500 | 55.56 |
| Creator | $19 | 1,000 | 52.63 |
| Pro | $29 | 1,500 | 51.72 |
| Studio | $39 | 3,000 | 76.92 |

Important: the current repository does **not** yet implement this table consistently. `/prices` currently exposes Free + Creator and hard-codes Creator at $9/month with `credits: 0`; `src/lib/subscription-plans.ts` currently defines Creator $9 / 1,000 credits, Pro $25 / 1,000, Studio $39 / 3,000. Those values are stale relative to the current commercial model and must not be copied into new UI or billing logic.

### Founder Program / crowdfunding canonical credits

Founder Credits use a separate campaign conversion from normal $0.01 top-ups:

- base conversion: **80 Founder Credits per $1 contributed**
- tier bonus: **5% to 20%**, depending on contribution tier
- Founder Credits are internal, non-equity credits
- Founder Credits must remain distinguishable from monthly subscription and purchased/top-up credits in the ledger

Canonical examples:

| Contribution | Base Founder Credits | Bonus | Total Founder Credits |
|---|---:|---:|---:|
| $10 | 800 | 5% = 40 | 840 |
| $25 | 2,000 | 7% = 140 | 2,140 |
| $50 | 4,000 | 10% = 400 | 4,400 |
| $100 | 8,000 | 12% = 960 | 8,960 |
| $250 | 20,000 | 15% = 3,000 | 23,000 |
| $500 | 40,000 | 17% = 6,800 | 46,800 |
| $1,000 | 80,000 | 20% = 16,000 | 96,000 |

**Repository mismatch:** `src/lib/founder-credit-tiers.ts` currently uses 100 base credits per $1 (for example $10 -> 1,000 base + 5%). `CrowdfundingCreditCalculator` consumes those values, so the public crowdfunding calculator is currently inconsistent with the updated Founder Program economics.

### Dashboard / top-up pricing

`src/lib/credit-packs.ts` and `/dashboard/credits` currently expose standard one-time top-ups at **100 Prompt Credits per $1**:

| Top-up | Credits |
|---|---:|
| $5 | 500 |
| $10 | 1,000 |
| $25 | 2,500 |
| $50 | 5,000 |
| $100 | 10,000 |

This is internally consistent with `PROMPT_CREDIT_COMMERCIAL_VALUE_USD = $0.01` in `ai-provider-pricing-engine.ts`. The dashboard should source pack price/credit values from `credit-packs.ts` only; do not duplicate them in UI constants.

Founder Credits are intentionally more conservative at the base level (80/$1) and then receive campaign bonuses. Do not silently reuse normal top-up conversion for crowdfunding.

### /prices audit

Files verified:
- `src/app/[locale]/prices/prices-client.tsx`
- `src/lib/subscription-plans.ts`
- Stripe checkout helpers consumed by the page

Findings:
1. `PLAN_METADATA` duplicates prices instead of importing the authoritative subscription catalog.
2. All visible plan metadata currently sets `credits: 0`, so the pricing page does not communicate the actual included monthly credit allowance.
3. `getPlanPrice()` duplicates another price table in the client.
4. Creator is currently $9 in the page, while the updated commercial target is Premium $9/500 and Creator $19/1,000.
5. Pro is currently staged at $25/1,000 in code; target is $29/1,500.
6. Studio $39/3,000 already matches the target monthly price and credits.
7. The page should consume one shared server/product catalog for price, annual price, monthly credits, availability and Stripe price IDs.

### Provider pricing refresh

Provider cost is **not** the user-facing Prompt Credit price. Provider pricing is an internal routing/margin input and must carry provider, model, processing tier, effective date and verification status.

#### Google Gemini Developer API / Google AI

Official pricing source: https://ai.google.dev/gemini-api/docs/pricing

Current 2026 pricing is model/tier dependent and includes promotional rates that change on **2027-01-01**. The provider registry must therefore store effective dates instead of treating one permanent number as truth. Current official examples include Gemini 3.x paid-tier pricing with separate input, output, cache and grounding charges.

The existing registry entries for `gemini-2.5-flash`, `gemini-2.5-pro` and the hard-coded `gemini-3.8-flash` $0.30/$2.50 pair must be re-verified before production routing.

#### Google Cloud / Vertex AI / Gemini Enterprise Agent Platform

Official pricing source: https://cloud.google.com/gemini-enterprise-agent-platform/generative-ai/pricing

Verified current examples (USD per 1M tokens, global standard where applicable):
- Gemini 3.1 Pro Preview: input $2.00 up to 200K context / $4.00 above 200K; output $12.00 / $18.00.
- Gemini 3.8 Flash through 2026-12-31: input $0.75; cached input $0.075; output $3.75.
- Gemini 3.8 Flash starting 2027-01-01: input $1.50; cached input $0.15; output $7.50.
- Non-global processing carries a higher price than global processing.

Cloud/Vertex pricing must be modeled separately from Gemini Developer API pricing even when the model family name is similar.

#### OpenAI API

Official pricing source: https://developers.openai.com/api/docs/pricing

Current flagship API examples (USD per 1M tokens; processing/context tier matters):
- GPT-6 Astra: short-context input $10.00, cached input $1.00, cache writes $12.50, output $50.00 in the surfaced flagship pricing table.
- GPT-6.1 Sol: short-context input $2.00, cached input $0.10, cache writes $2.50, output $10.00.
- GPT-6 Luna: short-context input $0.10, cached input $0.01, cache writes $0.125, output $0.50.

The current repository still contains `openai:gpt-4o` and `openai:dall-e-3` legacy estimates. They must not be used for current margin guarantees without a fresh verified price record.

#### ChatGPT subscriptions

ChatGPT subscription pricing is useful for competitive/business context but **must not** be used as an API cost input. API usage is billed separately.

Official sources:
- https://chatgpt.com/pricing
- https://help.openai.com/en/articles/6950777-what-is-chatgpt-plus
- https://openai.com/business/pricing/

Current public reference points include:
- ChatGPT Go: $8/month in the US (localized in some markets)
- ChatGPT Plus: $20/month
- ChatGPT Pro: multiple current tiers exist; verify the live pricing page before competitive publication
- ChatGPT Business: standard seat $25/month monthly or $20/month billed annually; premium seat $125/month monthly or $100/month billed annually
- Enterprise: custom pricing

### Required single-source-of-truth correction

The next implementation pass should make these catalogs authoritative:

```text
Prompt Studio subscription catalog
  -> /prices
  -> Stripe subscription checkout
  -> dashboard plan/credit display
  -> monthly credit grants

Prompt Studio top-up catalog
  -> dashboard credit packs
  -> checkout
  -> webhook validation

Founder reward catalog
  -> /crowdfunding
  -> calculator
  -> Stripe crowdfunding metadata
  -> founder claim fulfillment

Provider pricing catalog (versioned/effective-dated)
  -> margin guard
  -> routing eligibility
  -> cost telemetry
  -> admin pricing UI
```

No public page should own an independent hard-coded copy of prices or credit quantities.

### Re-audit release blockers

1. **Critical:** `/prices` commercial values are stale/duplicated and credits are shown internally as zero.
2. **Critical:** Founder calculator currently uses 100 base credits/$1 instead of the updated 80/$1 campaign base.
3. **High:** `subscription-plans.ts` is stale versus the current Premium/Creator/Pro/Studio commercial model.
4. **High:** provider pricing contains legacy/unverified values and lacks sufficient effective-date/tier detail for 2026 -> 2027 price changes.
5. **High:** Gemini Developer API and Google Cloud/Vertex pricing must be separate provider-price records.
6. **High:** ChatGPT subscription pricing must remain competitive context only; never substitute it for OpenAI API pricing.
7. **Medium:** dashboard top-ups are internally consistent at $0.01/credit, but the distinction from Founder conversion must be explicit in UI/documentation.


## Executive summary

Prompt Studio already has a substantial credit and generation foundation. T2–T6 should **extend and normalize the existing system**, not create a parallel wallet, ledger, job system, provider catalog, or billing database.

Verified foundations on `develop`:

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

The highest-risk finding is a development hack in `ensureCreditAccount()` that unconditionally forces an account to 100,000 credits. It must be removed or strictly development-gated before Prompt Credits can be trusted in production.

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

### Critical finding: forced development balance

`ensureCreditAccount()` currently contains:

```ts
// DEV HACK: Force 100,000 credits always so you can develop locally without limits
await AICreditAccount.updateOne(
  { userId },
  { $set: { balance: 100000, subscriptionBalance: 100000 } }
);
```

Because this update is not visibly guarded by `NODE_ENV === 'development'` in the service, T2/T5 must treat this as a release blocker. It can overwrite authoritative balances and invalidates real credit accounting if reachable outside a safe local environment.

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

1. **Critical — forced 100,000-credit update** in `ensureCreditAccount()`.
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
- documents the critical forced-balance risk,
- separates provider/model pricing from future operation-level Prompt Credit pricing.

No production behavior, pricing, balance, provider routing, or database schema is changed by T1.
