# ADR 004: Immediate generation dispatch

- **Status:** Accepted
- **Date:** 2026-09-28
- **Decision owner:** Prompt Studio engineering
- **Scope:** User-initiated AI generation jobs

## Context

The former path persisted jobs in MongoDB but relied on a periodic cron sweep
to begin work. That adds up to one minute of avoidable latency and makes user
traffic dependent on scheduler availability. The job state machine already has
an atomic lease and lock token, so it can safely receive duplicate delivery.

## Decision

Use **Upstash QStash** to dispatch every successfully persisted and
credit-reserved user job immediately to the existing Vercel processor. Keep
MongoDB as the durable queue record and keep the cron exclusively for recovery,
reconciliation, expired leases, and maintenance.

QStash was selected because it pushes directly to the existing HTTPS route,
signs requests, retries delivery, supports deduplication and flow control, and
does not require another compute service. The rollout is guarded by
`AI_QUEUE_DISPATCH_ENABLED`; `AI_QUEUE_KILL_SWITCH` reverses it to cron recovery.

## Options considered

| Option | Fit | Decision |
|---|---|---|
| Upstash QStash | Direct signed HTTP delivery to Vercel; retries, deduplication, rate and concurrency control | **Selected** |
| Vercel Queues | Native durable event stream and retries, but still beta as of the decision date | Revisit after general availability |
| Cloudflare Queues | Attractive cost and limits, but push consumption requires a Cloudflare Worker; pull consumption adds another poller | Not selected for this migration |
| Cron over MongoDB | Already available and durable, but introduces sweep latency and couples user starts to scheduler cadence | Recovery only |

## Cost and operational limits

Prices and limits were reviewed on 2026-09-28 and must be rechecked before a
material traffic increase:

- QStash Free includes 1,000 messages per day. Pay-as-you-go is $1 per 100,000
  message deliveries. Retries are additional deliveries, so they also count.
- Pay-as-you-go parallelism is capped at 100. Prompt Studio starts at 3 active
  deliveries and 30 starts per minute to protect provider and Vercel limits.
- QStash retains dead-letter messages for 7 days and permits payloads up to
  10 MB. Prompt Studio sends only a small job ID.
- Cloudflare Queues was the lower-cost alternative (10,000 operations/day on
  Free; 1 million operations/month included on Paid, then $0.40/million), but a
  normal message uses write, read, and delete operations and retries add more.
- Vercel function duration and the external provider remain the dominant
  generation constraints. QStash `timeout` is set to 300 seconds to align with
  the existing processor maximum.

## Failure and security model

1. Job creation is durable before publish. A publish error cannot lose the job.
2. The endpoint accepts a queue delivery only after SDK signature verification
   with current/next signing keys and exact request URL.
3. The signed body and destination query must name the same valid MongoDB ID.
4. Duplicate deliveries race on the atomic lease; only one owns processing.
5. A failed publish records fallback telemetry, and cron claims the queued job.
6. Application retries with `nextAttemptAt`, stuck leases, and old jobs continue
   to be reconciled by cron.

## Rollout

1. Configure QStash keys and rate limits in Vercel Preview.
2. Enable `AI_QUEUE_DISPATCH_ENABLED=true`; verify signed delivery, latency,
   duplicate delivery behavior, credit capture/refund, and fallback telemetry.
3. Repeat in Production with conservative flow control.
4. Keep the cron during migration and alert on queued-job age and fallback rate.
5. If delivery degrades, set `AI_QUEUE_KILL_SWITCH=true`; cron resumes as the
   sole trigger without changing persisted jobs or reserved credits.

## Consequences

New jobs normally begin as soon as QStash reaches the processor. The system
adds one external service and delivery cost, but removes cron from the critical
user path while preserving a reversible recovery mechanism.

## References

- [QStash pricing](https://upstash.com/pricing/qstash)
- [QStash publish API](https://upstash.com/docs/qstash/api-reference/messages/publish-a-message)
- [QStash signature verification](https://upstash.com/docs/qstash/howto/signature)
- [QStash flow control](https://upstash.com/docs/qstash/features/flowcontrol)
- [Vercel Queues](https://vercel.com/docs/queues)
- [Cloudflare Queues pricing](https://developers.cloudflare.com/queues/platform/pricing/)
- [Cloudflare Queues limits](https://developers.cloudflare.com/queues/platform/limits/)
