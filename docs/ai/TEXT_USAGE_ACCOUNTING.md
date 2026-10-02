# PromptStudio text quotas, credits, and usage accounting

Issue: #1063  
Parent: #1054

## Reuse the existing credit system

Prompt Studio already has:
- transactional credit wallets;
- reserve/capture/refund ledger operations;
- generation idempotency;
- estimated/actual token and cost fields;
- subscription plans.

#1063 does not introduce a second wallet.

The self-hosted text path adds a focused usage record that can be joined/reconciled
with the existing credit ledger when #1061 is updated after prerequisite merges.

## Product plan names

The issue originally describes Free/Starter/Pro/Business. The current product uses:

| Issue concept | Current Prompt Studio plan |
| --- | --- |
| Free | Free |
| Starter | Creator |
| Pro | Pro |
| Business | Studio |

Using the product's canonical names avoids a second subscription taxonomy.

## Initial monthly limits

These are conservative rollout defaults and are configurable without code changes:

| Plan | Generations/month | Reserved credits/generation |
| --- | ---: | ---: |
| Free | 25 | 1 |
| Creator | 250 | 1 |
| Pro | 1,000 | 1 |
| Studio | 5,000 | 1 |

Environment overrides:

```env
PROMPTSTUDIO_TEXT_FREE_MONTHLY_GENERATIONS=25
PROMPTSTUDIO_TEXT_CREATOR_MONTHLY_GENERATIONS=250
PROMPTSTUDIO_TEXT_PRO_MONTHLY_GENERATIONS=1000
PROMPTSTUDIO_TEXT_STUDIO_MONTHLY_GENERATIONS=5000

PROMPTSTUDIO_TEXT_FREE_CREDITS_PER_GENERATION=1
PROMPTSTUDIO_TEXT_CREATOR_CREDITS_PER_GENERATION=1
PROMPTSTUDIO_TEXT_PRO_CREDITS_PER_GENERATION=1
PROMPTSTUDIO_TEXT_STUDIO_CREDITS_PER_GENERATION=1
```

These defaults should be revisited using #1056 measured unit economics.

## Usage record

Collection:

`promptstudio_text_usage`

Per generation it stores:
- generation ID;
- user ID;
- plan;
- logical model;
- internal provider ID;
- UTC month key;
- state;
- reserved/charged credits;
- input/output token counts when available;
- runtime seconds when available;
- estimated/actual USD cost;
- error code;
- timestamps.

It deliberately does not store prompt or generated text.

## Lifecycle

### Reserve

Before an upstream model request:
1. resolve the authenticated user's canonical subscription plan;
2. use the generation UUID as the idempotency key;
3. check monthly quota;
4. create one `reserved` usage record;
5. reserve credits through the existing wallet boundary.

If either quota or credits are exhausted, do not call the model.

### Complete

On successful generation:
1. capture the existing credit reservation;
2. record input/output tokens from upstream usage when available;
3. record runtime/GPU seconds when available;
4. record estimated/actual cost;
5. set usage state to `completed`.

### Failure/cancellation

When generation fails before a billable successful result:
1. refund/release the existing credit reservation;
2. mark the usage record refunded;
3. store a stable error code only.

Never store prompt/response content in the usage collection.

## Queryability

`getPromptStudioTextUsage()` supports filters for:
- user;
- plan;
- logical model;
- month.

Indexes support:
- user + month;
- plan + month + model;
- model + provider + creation time.

This is the data source for #1064 observability/unit economics.

## Concurrency note

The usage service provides generation-level idempotency through a unique
`generationId`.

The monthly count is a rollout guard, not a globally serialized billing counter.
The authoritative monetary protection remains the transactional credit wallet.

If strict no-overage monthly quotas become contractually required, move the monthly
counter to an atomic Redis/Mongo counter/transaction before advertising it as a hard
billing entitlement.

## Dependency integration

#1061 is still open at implementation time. Once #1059/#1060/#1061 are merged, update
the streaming route to perform:

```text
authenticate
  -> rate limit
  -> resolve plan
  -> reserve monthly usage
  -> reserve credits
  -> model router
  -> stream
  -> capture/refund
  -> usage reconciliation
```

This issue intentionally avoids copying the open #1061 route into this branch.

## Acceptance mapping

- exhausted quota: reservation returns `MONTHLY_QUOTA_EXHAUSTED`;
- exhausted credits: existing transactional wallet blocks the model call;
- success/failure: usage lifecycle supports complete/refund reconciliation;
- query by user/plan/model: indexed query helper;
- configurable limits: environment-driven plan policy;
- cost telemetry: token/runtime/USD fields are first-class usage fields.
