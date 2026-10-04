# GCP-T11 / #838 — Status delivery, adaptive polling and recovery

Code: `src/lib/generation-status-policy.ts`, `src/lib/generation-cloud-recovery.ts` (+ `-server.ts`), `src/lib/ai-job-serializer.ts`.
Tests: `tests/unit/gcp-t11-status-recovery.test.ts`.

## Status API

`GET /api/ai/jobs/:id` now also returns `executionBackend`, `dispatch {transport, state, dispatchedAt}`, `providerOperation {status, pollCount, submittedAt, lastPolledAt}` and `pollAfterMs`, plus a `Retry-After` header. Internal identifiers (task names, submission keys, lock tokens) are not exposed.

`pollAfterMs` grows from a per-kind minimum to a maximum over the first two minutes of work (image 1.5 s→5 s, web 2 s→8 s, video 5 s→30 s); a queued job waiting for a retry/poll delivery is not polled before `nextAttemptAt` (capped at 5 min); terminal jobs return `null`.

## Recovery (runs inside the existing `/api/ai/jobs/sweep` watchdog)

| Problem | Detection | Action |
|---|---|---|
| Expired lease / stuck in-flight | existing `sweepStuckGenerationJobs` | unchanged (recover to `queued` or dead-letter + refund) |
| Lost delivery of a cloud job (failed enqueue, failed follow-up, task dropped after max transport attempts — Cloud Tasks has no DLQ, MongoDB `dead_letter` is the DLQ) | `queued`, due for > 2 min, unleased, reserved, pinned to a live cloud backend | re-enqueue on the **same** backend, task key `recovery-<10-min bucket>` |
| Operator killed a cloud backend | `<PREFIX>_AI_KILL_SWITCH=true` | jobs with `attempts = 0` and no provider operation are moved back to legacy atomically; anything that started stays pinned for the operator |
| Reservation stranded on a terminal job (any backend) | `failed/dead_letter/cancelled` + `creditsState: reserved` for > 5 min | release through the idempotent ledger |
| Completed but still reserved | same, `completed` | reported only (`generation_completed_with_reserved_credits`); never auto-charged |

Video jobs between polls are `queued` with a future `nextAttemptAt`, so neither the stuck sweeper nor recovery touches them until a poll delivery is actually overdue.

## Legacy routes

`/api/ai/jobs/process` (legacy worker/orchestrator) and `/api/ai/jobs/sweep` (watchdog) are kept. Note: `vercel.json` has had **no crons since a0eb0329 (2026-09-30)**, so the sweep currently only runs when an admin triggers it. Scheduling it (Vercel cron, or Cloud Scheduler → worker once recovery moves to GCP) is a decision for the activation step; it is a prerequisite for any canary.
