# GCP-T1 / #828 — Current AI Worker Baseline

Date: 2026-10-01  
Scope: Image, Video and Web generation before GCP Cloud Run migration.  
Behavior change: none.

## Executive baseline

The current durable generation system is already substantially migration-ready. Vercel owns submission and the current execution endpoint, MongoDB owns job truth, QStash provides immediate at-least-once delivery when enabled, and Vercel Cron provides recovery. Prompt Credits are reserved before dispatch and reconciled at terminal execution.

This document is the **pre-GCP measurement contract**. It deliberately separates metrics already persisted from metrics that cannot be truthfully reconstructed from source code alone.

## Current pipeline

```text
client
 -> POST /api/ai/jobs
 -> validate/provider/model/operation
 -> server-authoritative Prompt Credit pricing
 -> create AIGenerationJob
 -> reserve credits
 -> dispatchGenerationJob()
      -> QStash (normal immediate path when enabled)
      -> cron-recovery fallback when disabled/missing/publish failure
 -> POST/GET /api/ai/jobs/process
 -> atomic claim + lease
 -> runAIJob()
 -> provider
 -> result/R2 where applicable
 -> actual usage/cost/duration
 -> capture credits OR retry/refund/dead-letter
 -> MongoDB terminal state
 -> UI polling/status

Recovery:
Vercel Cron */1 -> /api/ai/jobs/process
Vercel Cron */5 -> /api/ai/jobs/sweep
```

## Workload mapping for migration

| GCP workload | Current job kind | Current execution boundary | Migration order |
|---|---|---|---|
| Image | `image` | `/api/ai/jobs/process` -> `runAIJob` | 1 |
| Video | `video` | same | 2 |
| Web | `web` operations are represented through the existing job/provider runner contracts; project-related generation also exists | same | 3 |

Before GCP-T7, implementation must confirm the exact persisted kind(s) used by every Web/Page Composer call site rather than assuming all web work is one enum value.

## Existing measurable fields

### AIGenerationJob (durable, primary baseline)

Already persisted:
- workload/kind
- provider and modelId
- operation/operationCode
- correlationId
- providerRequestId
- status
- attempts/maxAttempts
- retryable/errorCategory/failureMetadata
- createdAt/startedAt/completedAt/deadLetterAt
- actualDurationMs
- estimatedCostUsd
- actualCostUsd
- estimated/actual input/output tokens
- outputResolution/outputQuality
- creditCost/creditsCharged/creditsState
- lease/lock/recovery metadata

This collection is the authoritative source for volume, terminal success/failure, retry count, duration, provider/model mix, cost coverage and credit state.

### ObservabilityEvent (90-day TTL)

Already records:
- generation completed/failure/retry/dead-letter
- provider request latency/status/error category
- queue fallback events
- sweep/recovery events
- credit reconciliation failures
- job/correlation/provider/model metadata where emitted
- duration/cost/credit values where emitted

Caution: ObservabilityEvent expires after 90 days and is diagnostic telemetry, not the financial source of truth.

## Baseline metrics to capture before first GCP canary

Use identical windows for legacy and GCP comparison: recommended 7 days and 30 days, plus a minimum sample count per workload.

### Volume
- submitted jobs by Image/Video/Web
- completed
- failed/dead_letter
- cancelled
- retrying/recovered
- jobs per provider/model

### Reliability
- success rate = completed / terminal jobs
- dead-letter rate
- jobs requiring >1 attempt
- average attempts
- sweep recovery count
- expired lease recovery count
- credit reconciliation failure count

### Latency
Compute from durable job timestamps/actualDurationMs:
- p50 actualDurationMs
- p95 actualDurationMs
- p99 where sample size is sufficient
- queue wait = startedAt - createdAt
- end-to-end = completedAt - createdAt
- provider request latency from generation_provider_request events

### Cost
- sum estimatedCostUsd
- sum actualCostUsd where present
- actualCostUsd coverage = jobs with actual cost / completed jobs
- cost per completed generation by workload/provider/model
- credits reserved vs credits charged
- provider cost per 1,000 credits charged

### Dispatch/recovery
- QStash dispatch success is currently returned to the submission caller but **not durably stored on AIGenerationJob**
- `generation_queue_fallback` records fallbacks
- process cron invocation count is not a durable application metric
- sweep completion/recovery is observable
- therefore exact historical QStash-vs-cron share cannot be reconstructed reliably from current durable data

This is a known baseline gap, not a value to estimate.

## Queries/aggregations required for the snapshot

The implementation of the operational snapshot should aggregate `ai_generation_jobs` by date window, kind, provider and model and calculate:
- count/status distribution
- success/dead-letter rate
- attempts distribution
- avg/p50/p95 duration
- queue wait/end-to-end latency
- estimated/actual cost and actual-cost coverage
- credit state and charged credits

Observability should separately aggregate:
- `generation_queue_fallback`
- `generation_provider_request`
- `generation_retry_scheduled`
- `generation_dead_lettered`
- `generation_credit_reconciliation_failed`
- recovery/sweep events

Do not join raw prompts or generated media into baseline reporting.

## Gaps that GCP telemetry must close

1. **Dispatch provenance** — persist queue backend/mode and dispatch timestamp/message/task ID.
2. **Worker identity** — service, region and Cloud Run revision.
3. **Queue attempt** — delivery/retry attempt separate from application/provider attempt.
4. **Infrastructure latency** — enqueue -> worker receive and worker execution duration.
5. **Provider cost coverage** — `actualCostUsd` exists but is nullable; #837 must measure coverage and close provider-specific gaps.
6. **Provider request ID coverage** — nullable today.
7. **Cron/QStash cost** — source code cannot provide actual Vercel/QStash invoice cost; obtain this from provider billing dashboards for the same comparison window.
8. **GCP worker cost** — unavailable until canary; #839 must compare Cloud Run/queue cost using GCP billing/export metrics.

## Safety baseline

Current correctness properties to preserve:
- user/idempotency uniqueness at submission
- generation-level idempotency key
- atomic claim + lease
- max attempts
- typed retry decision
- no automatic retry for permanent/configuration classes
- reserve before execution
- capture exactly once semantics via ledger/credit state
- refund/release on terminal failure
- sweep recovery for stuck work

GCP must not replace these with queue-only guarantees. Queue delivery is expected to be at least once.

## Before/after comparison contract

A GCP canary is acceptable only if the same report can compare legacy and GCP for:
- sample size
- success/dead-letter rates
- p50/p95 end-to-end latency
- queue wait
- provider latency
- attempts/retries
- providerCostUsd and coverage
- infrastructure cost
- credits charged/refunded
- reconciliation failures
- stuck/recovered jobs

No promotion decision should be based only on latency.

## T1 acceptance status

- [x] Current execution pipeline documented.
- [x] Durable measurement sources identified.
- [x] Image/Video/Web comparison dimensions defined.
- [x] Current cron schedules documented.
- [x] Existing retry/idempotency/credit-safety baseline documented.
- [x] Measurement gaps explicitly identified instead of invented.
- [ ] Production numeric values captured from live MongoDB/observability/billing.

The final checkbox requires production data access and provider billing data. Source-code inspection alone cannot honestly produce live volume, p95 latency or dollar spend.

## Inputs for GCP-T2

GCP-T2 (#829) can proceed without changing generation behavior. It should provision isolated identities/secrets and must not grant Cloud Run broader access than required by this baseline architecture.
