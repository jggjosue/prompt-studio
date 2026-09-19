# AI Credit System Implementation Plan

## Overview
Extend the existing Mongo-backed AI job credit system into a server-owned, cost-aware credit ledger covering Gemini, OpenAI, Anthropic, image, video, project/web, prompt optimization, and other LLM workflows without changing existing Stripe access semantics unexpectedly.

## Existing architecture
- Billable async path: `AIGenerationJob` -> `/api/ai/jobs` -> `/api/ai/jobs/process` -> `ai-job-service`.
- Existing account/ledger: `AICreditAccount` and `AICreditLedger` support total balance plus reserve/capture/refund.
- Existing top-ups: `CreditPurchase`, `/api/credits/checkout`, and signed Stripe webhook handling.
- Existing subscription plans: `subscription-plans.ts` declares Creator/Pro/Studio credits, but webhook events do not grant period credits.
- Direct bypasses: server actions and Genkit routes for synchronous image, web, prompt optimization, and component personalization.

## Architecture decisions
- Keep `AIGenerationJob` as the canonical billable execution record.
- Extend `AICreditLedger` rather than introduce a competing accounting system.
- Preserve legacy `balance`, `reserved`, `creditCost`, and operation fields during migration; add subscription/purchased buckets and immutable transaction metadata.
- Centralize provider/model capabilities, verified model IDs, minimum credits, pricing inputs, and safety limits in one server-only configuration module.
- Use a server-owned estimator. Client model/credit/token values are hints only; routes recompute all charges.
- Use idempotency keys for jobs, ledger transactions, Stripe events, and subscription periods.
- Prefer expiring subscription credits before purchased credits; never silently expire purchased credits.
- Use Mongo atomic updates/transactions where available and preserve a reconciliation path for already-existing accounts.

## Phases

### Phase 1: Contracts and pure logic
- Add model/provider catalog with actual IDs discovered in the repository.
- Add conservative token estimation, cost-to-credit formula, safety limits, and typed errors.
- Add unit tests for model validation, estimates, limits, and insufficient-credit semantics.

### Phase 2: Ledger and account migration
- Extend account buckets and ledger transaction types while retaining legacy fields.
- Add server functions for balance breakdown, subscription grants, top-up grants, reservation, capture/reconciliation, refund, and idempotency.
- Add migration/reconciliation utilities for legacy accounts and existing reserved jobs.

### Phase 3: Canonical async jobs
- Replace kind-only fixed pricing in `/api/ai/jobs` with server-owned model-aware quotes.
- Store model, token estimates/usage, estimated/actual provider cost, credits reserved/charged, and request metadata on jobs.
- Reconcile actual usage after worker completion; release/refund failed infrastructure/provider attempts according to policy.
- Enforce max credits, token/cost limits, provider/model allowlists, rate limits, and idempotency.

### Phase 4: Stripe entitlements
- Update top-up catalog to 500/$6, 1500/$15, 5000/$45, 10000/$85 without changing unrelated product packs.
- Grant purchased credits only from verified, idempotent Stripe events.
- Grant subscription credits once per paid invoice/period, keyed by subscription and period; support upgrades, downgrades, cancellation, and renewal without retroactively changing existing grants.
- Preserve existing subscription metadata/access behavior.

### Phase 5: Direct AI paths and UX
- Route prompt optimizer, component personalization, chat, and synchronous generators through the canonical metering service or async jobs.
- Add pre-generation quote and insufficient-balance responses; never call providers after a failed reservation.
- Ensure provider keys remain server-side and direct server actions cannot bypass auth/rate/cost policy.

### Phase 6: Observability and reporting
- Persist durable financial usage fields outside expiring observability events.
- Add reusable admin metrics for revenue, actual provider cost, contribution margin, usage by provider/model/plan/user, and missing provider usage.

## Checkpoints
- After Phases 1-2: pure tests, typecheck, and ledger invariant tests pass.
- After Phase 3: async job API/worker tests pass, including concurrent reservations and failure refunds.
- After Phase 4: Stripe webhook tests pass for duplicate events, top-ups, invoice grants, upgrades, downgrades, cancellation, and purchased-credit preservation.
- After Phase 5: all billable AI entry points reject insufficient balance before provider calls.
- Before release: lint, full tests, production build, migration dry run, and production webhook replay test.

## Migration risks
- Existing `AICreditAccount.balance` may contain legacy initial credits and must not be silently reset.
- Existing `AICreditLedger` rows use job-only reserve/capture/refund fields.
- Existing top-up catalog IDs may be referenced by pending Stripe sessions; old IDs remain readable until settled.
- Stripe metadata and Clerk private metadata are already used for access; subscription credits must not become a second authority for plan status.
- Production Mongo transaction support and a scheduler for `/api/ai/jobs/process` must be verified before enabling strict reconciliation.
