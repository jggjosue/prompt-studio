# GCP-T3 / #830 — Cloud Tasks queue topology and security contract

## Decision

Use **Google Cloud Tasks** as the managed HTTP dispatch primitive for Prompt Studio generation jobs.

Why it fits this migration:
- authenticated HTTP delivery to Cloud Run with Google-issued OIDC identity;
- at-least-once delivery matches the existing claim/idempotency design;
- queue-level retry/backoff/rate controls;
- scheduled delivery supports retry timing;
- Cloud Run remains private;
- MongoDB remains the durable job source of truth.

Pub/Sub is not selected for the primary worker dispatch because the required primitive is a controlled authenticated HTTP task with explicit retry/rate semantics per generation job. This does not prevent Pub/Sub from being used later for analytics/events.

## Topology

Start with workload-isolated queues:
- `ps-ai-image`
- `ps-ai-video`
- `ps-ai-web`

Per environment, queue names/resources are isolated. All queues target the shared authenticated Cloud Run generation service initially; GCP-T5/T6/T7 may split services without changing the job payload contract.

## Payload contract

Versioned JSON only:

```json
{
  "version": 1,
  "jobId": "<Mongo ObjectId>",
  "correlationId": "<existing job correlation id>",
  "workload": "image"
}
```

Allowed workloads: `image | video | web`.

The payload MUST NOT contain:
- prompt/input body
- provider API keys
- Mongo/R2 credentials
- user email
- Prompt Credit balances
- generated media/base64

The worker reloads the durable job from MongoDB and validates that payload workload matches the stored job before claim/execution.

## Authentication

Cloud Tasks sends an OIDC token using the T2 `ps-ai-queue-invoker` service account. That identity has only `roles/run.invoker` on the target worker.

Target audience is the Cloud Run service URL (or explicitly configured audience). The service is not public/unauthenticated.

Google IAM authentication proves the caller may reach the worker; it does **not** replace application idempotency/claim/lease checks.

## Task identity / deduplication

Use deterministic task IDs derived from the durable generation identity, e.g. `job-<jobId>` for initial dispatch. Cloud Tasks task-name deduplication is an additional guard, not the correctness boundary.

Retries are deliveries of the same logical task/job. Provider execution safety remains enforced by MongoDB atomic claim, leases, persisted providerRequestId where applicable and terminal-state checks.

Do not dispatch the same job to both QStash and Cloud Tasks.

## Retry ownership

Cloud Tasks owns **transport delivery retries** (worker unreachable, eligible HTTP response).

The application owns **provider/business retries** already represented by job state, `attempts`, `maxAttempts`, `nextAttemptAt`, retry category and dead-letter semantics.

The worker response contract must distinguish:
- 2xx: task accepted/handled; Cloud Tasks stops transport retry.
- retryable infrastructure failure before safe application handling: non-2xx so Cloud Tasks may retry.
- permanent/terminal application outcome: persist terminal state/reconcile credits and return 2xx; do not ask Cloud Tasks to repeat a known permanent provider failure.

Avoid two independent exponential retry loops for the same provider error.

## Initial queue controls

Conservative starting policy; tune from T1 baseline/canary:
- max concurrent dispatches: image 3, video 2, web 2
- max dispatch rate: image 30/min, video 10/min, web 10/min
- min backoff: 10s
- max backoff: 300s
- max doublings: 5
- max attempts: 5 transport attempts

These are transport controls, not provider `maxAttempts`.

## Timeout

Cloud Tasks HTTP dispatch deadline must be compatible with the selected worker behavior and Google Cloud Tasks limits. Long-running Video provider operations must not depend on keeping one HTTP delivery open for the entire provider generation; T6 must persist providerRequestId and resume/poll safely.

## DLQ / recovery

Cloud Tasks does not become the canonical job ledger. Exhausted transport delivery is recovered from MongoDB state:
1. task repeatedly fails delivery;
2. durable job remains queued/processing with timestamps/lease;
3. GCP recovery/reconciliation identifies expired/stuck work;
4. recovery re-enqueues only when state/idempotency/providerRequestId rules allow;
5. terminal unrecoverable work transitions through the existing dead-letter/refund path.

`/api/ai/jobs/sweep` remains temporary safety during migration. T11/T15 move/narrow this responsibility after GCP recovery is proven.

## Cutover modes

T3 provisions/contracts the GCP path but does not switch production dispatch.

T8 will expose mutually exclusive modes:
- `legacy`: QStash -> /api/ai/jobs/process
- `gcp`: Cloud Tasks -> Cloud Run
- `recovery`: no immediate dispatch, cron/recovery only

Global kill switch must force recovery mode.

## Queue provisioning

`scripts/gcp/bootstrap-ai-worker-queues.sh`:
- enables Cloud Tasks API;
- creates/updates the three queues;
- applies conservative rate/retry settings;
- contains no credentials/secrets;
- does not change Vercel/QStash dispatch.

## T3 acceptance

- [x] managed queue primitive selected: Cloud Tasks
- [x] workload topology defined
- [x] versioned minimal payload defined
- [x] OIDC/private Cloud Run authentication contract defined
- [x] transport retry vs provider retry ownership separated
- [x] recovery/dead-letter approach defined
- [x] mutually exclusive legacy/GCP cutover rule defined
- [x] reproducible queue bootstrap added
- [ ] queues created in authorized real GCP environment
- [ ] authenticated synthetic task reaches deployed private Cloud Run endpoint

The final two checks require GCP-T4 deployment and authorized GCP access.
