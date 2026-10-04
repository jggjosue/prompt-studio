# GCP-T9 / #836 — Idempotency, retries, DLQ and credit safety

Code: `src/lib/generation-worker-core.ts` (backend-agnostic processor), wired by
`src/lib/generation-worker-runtime.ts`. Tests: `tests/unit/generation-worker-safety.test.ts`.

## Who retries what (one loop per error)

| Layer | Retries | Mechanism |
|---|---|---|
| Queue transport (Cloud Tasks, QStash) | Infrastructure failures only: worker unreachable, Mongo down before the job is safely handled → worker answers non-2xx | queue retry config (T3: 10s–300s, 5 attempts) |
| Prompt Studio (business/provider) | Provider outcomes | `attempts`/`maxAttempts`/`nextAttemptAt` + `generationRetryDecision` (60s base, ×2, ±20% jitter, cap 30 min) |

The worker always answers **2xx** once the job outcome is persisted (completed, retry scheduled, dead-lettered, ignored). A business retry on a cloud backend is **one delayed follow-up task** on the same backend (`deliveryKey = attempt-N`, `scheduleTime = nextAttemptAt`). An early duplicate delivery finds `nextAttemptAt` in the future and does nothing, so transport retries can never accelerate or multiply provider retries.

## Error matrix

| Error | Category | Auto retry |
|---|---|---|
| 429 / quota | `rate_limit_or_quota` | yes |
| 500, 502, 503, 504 | `provider_unavailable` | yes |
| Network (ECONNRESET, ECONNREFUSED, ENOTFOUND, EAI_AGAIN, undici socket, `fetch failed`) | `provider_unavailable` | yes |
| Timeout / abort / 408 | `timeout` | yes |
| 400 | `bad_request` | **no** |
| 401 / 403 | `auth_or_permission` | **no** |
| 404 | `model_not_found` | **no** |
| 422 / validation | `validation_error` | **no** |
| Missing credentials / config | `configuration_error` | **no** |
| 501, 505, other 5xx | `provider_error` | **no** |

Non-retryable or exhausted ⇒ `dead_letter` + credit release.

## Guarantees and how they are enforced

| Scenario | Guarantee | Enforcement |
|---|---|---|
| Duplicate queue delivery | ≤ 1 logical provider execution | atomic claim (status + lease + lockToken + backend pin) |
| Crash before provider submit | safe retry | lease expires, next delivery re-claims (`attempts+1`) |
| Crash after provider submit | no second generation | stable `generationIdempotencyKey` sent as `Idempotency-Key` on every attempt; long-running video uses the persisted `providerRequestId` (T6) |
| Success | capture exactly once | capture only after `→ finalizing` succeeds; ledger row unique per job+`capture` |
| Terminal failure | release exactly once | release only on dead-letter/exhausted path; ledger row unique per job+`refund`, conditional `reserved → refunded` |
| DLQ / redelivery after terminal | no new charge or refund | terminal jobs are not claimable; ledger idempotency |
| Retries | never re-reserve | reservation happens once in `POST /api/ai/jobs`; the worker only captures/releases |

Credits use the existing boundary (`generation-credit-boundary.ts` → `ai-job-service.ts` ledger). No second credit system was introduced.
