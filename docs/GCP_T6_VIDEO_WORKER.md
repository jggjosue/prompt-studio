# GCP-T6 / #833 — Video on the Cloud Run worker (long-running operations)

Code: `src/lib/generation-worker-core.ts` (`runLongRunning`), `src/lib/video-operation-adapters.ts`.
Tests: `tests/unit/gcp-t6-video-worker.test.ts` (synthetic provider, no paid calls).

## Flow

```
claim → [providerOperation.providerRequestId?]
          no  → persist {status: submitting, submissionKey} → submit → persist {status: submitted, providerRequestId}
          yes → (resume)
       → poll every AI_VIDEO_POLL_INTERVAL_SECONDS for at most AI_VIDEO_POLL_BUDGET_SECONDS
          done ok     → R2 upload → finalizing → capture credits → completed
          failed      → classified error → retry or dead_letter + release
          still busy  → processing → queued (nextAttemptAt = +interval, attempts compensated)
                        + one delayed Cloud Task `poll-N` on the same backend
          > AI_VIDEO_MAX_OPERATION_SECONDS since submit → dead_letter (VIDEO_OPERATION_EXPIRED) + release
```

No HTTP request is held open for the whole render; each delivery is bounded.

## Persisted on `AIGenerationJob`

`providerOperation = { status, provider, modelId, providerRequestId, submissionKey, attempt, pollCount, submittingAt, submittedAt, lastPolledAt, completedAt }`
plus the existing `providerRequestId`, `attempts`, `status`, `correlationId`, and timestamps.

## Restart / crash safety

| Crash point | Next delivery does |
|---|---|
| before submit | submits normally |
| provider answered with an HTTP error | operation cleared; retry policy decides; a later submit is safe |
| after provider accepted, before the id was persisted (`status: submitting`) | **non-idempotent provider (Veo): never re-submits** → dead_letter + refund, flagged for manual reconciliation. Idempotent provider: re-submits with the same `submissionKey` |
| while polling (id persisted) | resumes polling the same `providerRequestId` |
| after R2 upload, before finalize | polls again (done), re-uploads to the same deterministic key, finalizes |

Polling cycles never consume `attempts`, so long renders are not mistaken for failures. Credits: reserved at creation, captured once on success, released once on terminal failure (same boundary as all jobs).

## Providers

| Provider | Cloud runtime path |
|---|---|
| `veo` / `google` | `createVeoVideoAdapter` — `ai.models.generateVideos` + `ai.operations.getVideosOperation` (`@google/genai`), `GEMINI_API_KEY` from Secret Manager, output → R2 `generated/videos/<user>/<job>.mp4` |
| runway, kling, luma, pika, hailuo, sora | unchanged synchronous `runAIJob` path (external worker). Add an adapter before moving them |

Legacy backend: unchanged (synchronous path). The long-running path is only used on cloud backends, and `GCP_AI_VIDEO_ENABLED=false` keeps every video job on legacy.

Not executed against the real Veo API (no paid traffic was authorized); the adapter is type-checked against the installed SDK and the flow is covered with a synthetic provider.
