# Prompt Studio — GCP AI Workers Migration Execution Plan

Parent epic: #827. Existing implementation issues: #828–#842.

## Decision

Do not create a second GCP backlog. Execute the existing #828–#842 sequence, but treat the current MongoDB `AIGenerationJob`, Prompt Credits boundary, QStash dispatch, `/api/ai/jobs/process`, `/api/ai/jobs/sweep`, retries/dead-letter and observability code as migration inputs rather than greenfield work.

Target:

```text
Vercel Generation API
  -> validate + server-authoritative price
  -> persist AIGenerationJob in MongoDB
  -> reserve Prompt Credits exactly once
  -> Google Cloud managed queue
  -> authenticated Cloud Run worker
  -> provider
  -> R2
  -> MongoDB terminal state
  -> capture/refund Prompt Credits exactly once
  -> UI status
```

Vercel, Clerk, Stripe, MongoDB, R2, Resend and the frontend remain in their current roles.

## Current-state findings

- `POST /api/ai/jobs` is already the canonical submission boundary.
- MongoDB `AIGenerationJob` is already the durable source of truth.
- Prompt Credits are reserved before dispatch and captured/refunded through the existing generation credit boundary.
- Immediate dispatch currently uses QStash through `generation-queue-dispatch.ts`.
- `/api/ai/jobs/process` is both the QStash destination and a one-minute Vercel Cron recovery worker.
- `/api/ai/jobs/sweep` runs every five minutes for stale-job/dead-letter recovery.
- Existing claim/lease/idempotency and retry semantics must be reused, not reimplemented independently inside GCP.
- Existing observability/credit telemetry is the baseline for #837 and must be extended with GCP worker identity/revision and queue attempt metadata.

## Execution gates

### Gate A — Baseline and GCP foundation

**GCP-T1 — #828 Baseline current worker behavior**
Document current Image/Video/Web volumes, p50/p95 duration, failures, retries, QStash vs cron fallback, provider/model usage, providerCostUsd coverage and credit reconciliation failures. No behavior change.

**GCP-T2 — #829 Environments/IAM/Secret Manager**
Define dev/preview/prod projects or equivalent isolated configuration, Cloud Run service accounts, queue caller identity and least-privilege secret access. Secrets never enter queue payloads or source control.

**GCP-T3 — #830 Queue topology/security contract**
Use a Google-managed HTTP dispatch primitive suitable for authenticated Cloud Run. Queue payload contains only durable identity/context such as jobId/correlationId; MongoDB remains authoritative. Define OIDC/service-account authentication, timeout, retry ownership, DLQ/recovery and workload routing.

Gate A exit: an authenticated synthetic queue message reaches a non-public Cloud Run worker without a paid provider call.

### Gate B — Shared worker runtime

**GCP-T4 — #831 Shared Cloud Run runtime**
Extract/reuse the execution boundary currently reached through `/api/ai/jobs/process`. Worker must load the job, atomically claim/lease it, enforce eligible state, run through existing provider adapters, persist progress/terminal state, reconcile credits and emit structured telemetry. Add health/readiness and graceful shutdown.

Important: do not let Cloud Run create a second implementation of credit accounting. It must call the same server-authoritative credit semantics.

Gate B exit: synthetic job reaches a terminal state exactly once under duplicate queue delivery.

### Gate C — Workloads

**GCP-T5 — #832 Image worker**
First production workload. Preserve provider abstraction, R2 asset keys, Mongo state, pricing snapshot and credit reconciliation. Feature flag: legacy vs GCP per Image workload.

**GCP-T6 — #833 Video worker**
Persist providerRequestId and make long-running submit/poll/finalize restart-safe. Never hold a Vercel request open.

**GCP-T7 — #834 Web worker**
Move heavy Web/PageSchema generation while keeping /page-composer and validation contracts on the existing application surface.

Gate C exit: each workload can run through GCP independently and roll back independently.

### Gate D — Dispatch, correctness and telemetry

**GCP-T8 — #835 Vercel -> GCP immediate dispatch**
Replace QStash as the primary dispatch path only after Gate C has a valid target worker. Submission remains: validate -> price -> persist -> reserve -> enqueue -> 202. Add workload feature flags and a global kill switch.

Recommended modes:
- `legacy`: current QStash/process path
- `gcp`: managed GCP queue -> Cloud Run
- `recovery`: no immediate dispatch; recovery only

Never dual-dispatch the same job to QStash and GCP.

**GCP-T9 — #836 Idempotency/retry/DLQ/credit safety**
Concurrency and failure matrix must prove:
- duplicate queue delivery -> one provider execution
- worker crash before provider -> safe retry
- crash after provider submission -> providerRequestId recovery where applicable
- 429/network/eligible 5xx/timeout -> bounded retry/backoff
- 400/401/403/config/validation -> no automatic retry
- terminal failure -> refund/release exactly once
- success -> capture exactly once
- DLQ/recovery -> no duplicate charge

**GCP-T10 — #837 GCP observability/providerCostUsd**
Every generation should correlate job/generation ID, correlation ID, workload, provider, model, attempt, queue identity, Cloud Run service/revision, latency, providerRequestId, sanitized failure, usage, providerCostUsd, estimated/actual credits and timestamps. Never log prompts containing sensitive data, secrets or base64 media.

Gate D exit: GCP path is immediate, traceable and financially safe under duplicate/failure tests.

### Gate E — Status/recovery and canary

**GCP-T11 — #838 Status + stuck recovery**
Reuse durable Mongo status. Reduce fixed polling where possible. Recovery can reclaim expired leases but cannot blindly resubmit a provider operation.

**GCP-T12 — #839 Image canary**
Route a controlled Image percentage to GCP. Compare legacy vs GCP success, p50/p95, provider cost, infrastructure cost, retries and credit correctness. Instant rollback required.

**GCP-T13 — #840 Image 100%, then Video canary/100%**
Promote only from measured evidence.

**GCP-T14 — #841 Web canary/100%**
Migrate Web last and validate output correctness in addition to latency/cost.

### Gate F — Retirement

**GCP-T15 — #842 Budgets, alerts and legacy retirement**
Configure GCP budget/usage alerts and unit economics. After Image/Video/Web are stable:
1. disable QStash publishing;
2. remove `/api/ai/jobs/process` from normal dispatch;
3. remove the one-minute process cron only after the rollback observation window;
4. keep `/api/ai/jobs/sweep` temporarily as reconciliation/stuck-job safety;
5. move recovery responsibility to the GCP/DLQ reconciliation design;
6. only then simplify or retire `sweep`;
7. delete QStash env/config/code after rollback is no longer required.

## process/sweep migration rule

`process` is not dead code today. It is the current execution boundary and recovery cron. It can be retired only after GCP-T8 through T14 prove Cloud Run is primary and rollback has completed.

`sweep` is not the primary worker. Keep it longer than `process` because it protects stale leases/dead-letter/credit recovery. Retire or narrow it only when #838/#842 provide equivalent GCP recovery and reconciliation.

## Branch/PR discipline

For every task:
1. branch from latest `develop`;
2. inspect and extend existing contracts before coding;
3. one task -> one branch;
4. add/update tests;
5. run relevant tests/typecheck/lint when the repository dependency state permits;
6. document env/IAM/migrations/rollback;
7. commit and open PR to `develop`;
8. never auto-merge.

## Definition of done

Image, Video and Web generation dispatch immediately through authenticated GCP infrastructure; Cloud Run workers reuse the canonical job and Prompt Credit contracts; duplicate execution and duplicate charging are prevented; transient failures retry safely; terminal failures reconcile credits; stuck jobs recover; provider and infrastructure costs are traceable; workload rollback remains available through canary; and Vercel Cron/QStash are no longer the normal generation worker.
