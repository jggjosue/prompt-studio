# AI Generation Queue

MongoDB is the durable source of truth for generation jobs. Upstash QStash is
the immediate delivery layer: after the API persists a job and reserves its
credits, it publishes that job ID to the processor. The browser receives `202`
and polls the durable job state; generation does not depend on a cron sweep.

```text
POST /api/ai/jobs
  -> validate and price
  -> persist queued job in MongoDB
  -> reserve credits
  -> publish job ID to QStash
  -> signed POST /api/ai/jobs/process with the job ID
  -> atomic lease claim
  -> provider -> finalize -> capture credits
```

## Delivery guarantees

- QStash delivery is at least once. The processor is safe under duplicate
  delivery because `claimGenerationJob` atomically moves only one eligible job
  into `processing` and assigns a lock token.
- The message contains only the MongoDB job ID. Prompts, provider credentials,
  and generated assets remain in their existing stores.
- The destination verifies `Upstash-Signature` and also requires the signed
  body job ID to equal the query-string job ID.
- `vercel.json` keeps the protected per-minute cron as a recovery path for
  publish failures, expired leases, delayed application retries, and jobs that
  predate the migration. It is no longer the primary trigger.

Failures inside a job retain the existing three-attempt application policy and
credit rules: credits are reserved on creation, captured on completion, and
refunded after final failure.

## Configuration and rollback

Set the following server-only variables in Vercel Preview first, then
Production:

```dotenv
AI_QUEUE_DISPATCH_ENABLED=true
AI_QUEUE_KILL_SWITCH=false
QSTASH_TOKEN=...
QSTASH_CURRENT_SIGNING_KEY=...
QSTASH_NEXT_SIGNING_KEY=...
AI_QUEUE_PARALLELISM=3
AI_QUEUE_RATE_PER_MINUTE=30
```

`AI_QUEUE_PROCESS_URL` is optional and overrides the public processor URL.
Leave it empty to derive the URL from `DOMAIN`.

Rollback is immediate and does not require a deployment: set
`AI_QUEUE_KILL_SWITCH=true`. Newly persisted jobs remain queued and the existing
cron recovers them. Do not remove the cron until migration telemetry shows both
dispatch and recovery behavior are healthy.

The creation response includes `dispatch.mode`, `dispatch.dispatched`, and an
optional reason. The application also records `generation_queue_fallback` when
it must rely on recovery.

See [ADR 004](architecture/adr-004-immediate-generation-dispatch.md) for the
provider evaluation, costs, limits, and rollout plan.
