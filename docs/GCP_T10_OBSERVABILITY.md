# GCP-T10 / #837 — Execution observability

Code: `src/lib/generation-execution-log.ts`, emitted from `generation-worker-core` via `logExecution`.
Tests: `tests/unit/gcp-t10-execution-observability.test.ts`.

## One record per execution outcome

`message = "ai_generation_execution"`, one JSON line on stdout → Cloud Logging `jsonPayload` (Vercel logs on legacy).

| Group | Fields |
|---|---|
| Identity | `jobId`, `generationId` (generationIdempotencyKey), `correlationId`, `userRef` (salted hash, never the raw user id) |
| Routing | `workload`, `kind`, `executionBackend`, `queue`, `dispatchTransport`, `provider`, `model` |
| Outcome | `outcome` (completed / retry_scheduled / poll_scheduled / dead_letter / failed / ownership_lost), `status`, `attempts`, `maxAttempts`, `latencyMs` |
| Provider | `providerRequestId`, `errorCategory`, `errorCode`, `httpStatus` |
| Usage & cost | `usage.{inputTokens, outputTokens, mediaSeconds, mediaCount}`, `providerCostUsd`, `estimatedCostUsd`, `estimatedCredits`, `actualCredits`, `creditsState` |
| Worker | `workerService` (`K_SERVICE` / vercel), `workerRevision` (`K_REVISION` / deployment id) |
| Time | `timestamps.{createdAt, startedAt, completedAt, loggedAt}` |
| Labels | `logging.googleapis.com/labels`: workload, executionBackend, outcome, provider |

`severity`: ERROR for dead_letter/failed, WARNING for retry/ownership_lost, INFO otherwise.

## Never logged

Built from an allow-list: prompts, `input`, `result` payloads, emails, raw user ids, API keys, auth tokens, credentials, secret values and base64/media are never read. Every free-text value goes through `redactSecrets` (Bearer, `sk-`, `sk_live_`, `AIza`, AWS key ids, `whsec_`, Resend keys, JWTs, Mongo URIs, data URIs, long base64).

## Cloud Logging / Monitoring (created by `scripts/gcp/bootstrap-ai-observability.sh`, infra task)

Log filter:
```
resource.type="cloud_run_revision"
jsonPayload.message="ai_generation_execution"
```

Log-based metrics:
- `ai_generation_outcomes` (counter) — labels: `outcome`, `workload`, `provider`, `executionBackend`.
- `ai_generation_latency_ms` (distribution) — value `jsonPayload.latencyMs`, labels: `workload`, `outcome`.
- `ai_generation_provider_cost_usd` (distribution) — value `jsonPayload.providerCostUsd`, label `workload`.

Alert policies (canary gates): dead-letter ratio > 5 % over 15 min per workload; p95 latency > 2× legacy baseline (T1); any `ownership_lost` spike; Cloud Tasks queue depth > 100 for 10 min.
