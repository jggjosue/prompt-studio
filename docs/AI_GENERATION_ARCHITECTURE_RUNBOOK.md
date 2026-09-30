# Prompt Studio — AI Generation Diagnosis & Architecture Runbook

> Related epics: #757 and #779  
> Scope: Gemini image generation, 400/401 diagnosis, asynchronous jobs, queues, image/video/web generation, credits, retries, storage, polling, recovery and observability.

## 1. Current production symptoms

The production route `GET /api/ai/jobs/process` completes at the Vercel function layer with HTTP 200, but the generation job fails internally.

Observed production evidence:

- Route: `/api/ai/jobs/process`
- Trigger: `vercel-cron/1.0`
- Vercel execution duration: ~1.16 s
- Memory used: ~211 MB
- External POST responses observed: **400** (~73 ms) and **401** (~31 ms)
- Generation log:
  - category: `ai_generation`
  - operation: `generation_failed`
  - provider: `google`
  - errorCode: `Error`
  - durationMs: ~209
- UI symptoms:
  - different prompts may show the same abstract/repeated image
  - `google · 0 créditos usados`
  - `Generación en curso: Generando contenido`
  - `image generation failed`
  - repeated polling of `GET /api/ai/jobs/{id}`

### Working hypothesis

Vercel is successfully invoking the worker. The immediate failure is an outbound integration failure. The 400 and 401 must be attributed to their exact services before changing hosting architecture.

Possible causes include Gemini request/model/API configuration, production authentication, storage/authentication, or another internal/external service. These are hypotheses until #780 identifies each outbound request.

**Do not migrate away from Vercel solely because of this incident.**

---

## 2. Immediate execution order

Execute these tasks in order. Do not skip to queue migration until the direct provider path is understood.

### Phase A — Identify the current failure

1. **#780 — Identify the external POST requests returning 400 and 401**
   - Add safe structured logging around every outbound generation request.
   - Capture service/provider, sanitized host/endpoint label, HTTP status, duration, job/generation ID, correlation ID, model and retryability.
   - Capture safe provider error code/message.
   - Never log API keys, Authorization headers, cookies or full base64 data.
   - Exit condition: both 400 and 401 have an identified owner/root cause.

2. **#781 — Verify Gemini production credentials, environment scope and model configuration**
   - Confirm the Gemini environment variable exists in Vercel Production without printing it.
   - Confirm Production uses the intended deployment configuration.
   - Verify model, provider, SDK/API version and endpoint configuration.
   - If credentials are rejected, rotate safely and redeploy.
   - Exit condition: production authentication works or the exact auth failure is documented.

3. **#782 — Add a production-safe Gemini image smoke test**
   - Prove `prompt → Gemini → valid image` without queue, credits, MongoDB, R2 or chat UI.
   - Restrict the diagnostic endpoint/harness so it cannot become a public free-generation endpoint.
   - Exit condition: Gemini itself clearly passes or fails with actionable evidence.

### Phase B — Complete Gemini image diagnosis

Continue the existing #757 tasks as necessary:

4. **#758** verify the production Gemini image model.
5. **#759** isolated Gemini image test endpoint/harness.
6. **#760** safe response metadata.
7. **#761** correct image response parsing.
8. **#762** remove misleading placeholder/fallback success images.
9. **#763** render the generated image directly before storage.
10. **#764** unique storage keys per generation.
11. **#765** eliminate stale generation caching.
12. **#766** per-generation UI state.
13. **#767** correct generation-in-progress/concurrency locking.
14. **#768** typed provider error mapping.

The key diagnostic chain is:

```text
Prompt
  ↓
Gemini
  ↓
valid image bytes
  ↓
Storage
  ↓
Database
  ↓
Credits
  ↓
Chat UI
```

Validate one layer at a time.

---

## 3. Target generation architecture

Keep Prompt Studio/Next.js on Vercel while decoupling long-running generation work.

```text
Prompt Studio / Next.js
        ↓
POST /generations
        ↓
Validate request
        ↓
Estimate + reserve credits
        ↓
Persist GenerationJob
        ↓
Managed Queue
        ↓
Generation Worker
   ┌────┼─────┐
   ↓    ↓     ↓
 Image Video  Web
   ↓    ↓     ↓
AI/provider gateway
        ↓
R2 / output storage
        ↓
Database
        ↓
Credit reconciliation
        ↓
Status/realtime update
```

Cron should eventually be used primarily for recovery, reconciliation, cleanup and maintenance—not as the normal trigger for a user pressing Generate.

---

## 4. Canonical GenerationJob

**#783 — Define one canonical GenerationJob state machine for image, video and web.**

Suggested conceptual contract:

```ts
type GenerationJob = {
  id: string;
  userId: string;
  type: "image" | "video" | "web";
  provider: string;
  model: string;
  prompt: string;
  status:
    | "queued"
    | "processing"
    | "uploading"
    | "finalizing"
    | "completed"
    | "failed"
    | "cancelled";
  attempt: number;
  correlationId: string;
  estimatedCredits: number;
  actualCredits?: number;
  providerRequestId?: string;
  outputRef?: string;
  errorCode?: string;
  errorMessage?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
};
```

Canonical lifecycle:

```text
queued
  ↓
processing
  ↓
uploading / finalizing
  ↓
completed

Any eligible stage → failed
Any cancellable stage → cancelled
```

State transitions must be durable and atomic.

---

## 5. Concurrency and idempotency

**#785 — Implement atomic job claiming and generation-level idempotency.**

Requirements:

- Atomically claim `queued → processing`.
- Store worker/lease ownership.
- Every generation has a stable idempotency key.
- Duplicate queue delivery must not duplicate provider calls or charges.
- A crashed worker must have an expiring/recoverable lease.
- Provider submission, persistence and credit reconciliation must be duplicate-safe.

Example:

```text
worker A ─┐
          ├─ claim gen_123 → only one succeeds
worker B ─┘
```

Related existing issues: #145, #237 and #440.

---

## 6. Retry and dead-letter policy

**#786 — Add retry policy and dead-letter recovery by error category.**

Do not retry every failure.

Default non-retryable categories:

- malformed/invalid request
- authentication/authorization failures
- unsupported model/configuration
- validation failures

Potentially retryable categories:

- timeout
- rate limiting
- eligible provider 5xx/unavailable failures
- temporary network failure

Use capped exponential backoff with jitter.

```text
attempt 1
   ↓ transient failure
attempt 2 after backoff
   ↓ transient failure
attempt 3 after backoff
   ↓ exhausted
dead-letter / terminal recovery state
```

A dead-letter record must preserve generation ID, correlation ID, provider/model, error category, attempt count and safe provider diagnostics. Reprocessing must remain idempotent.

Related existing issue: #142.

---

## 7. Queue migration

**#784 — Replace cron-driven normal generation with immediate queue dispatch.**

Target request flow:

```text
User clicks Generate
        ↓
POST /generations
        ↓
validate
        ↓
estimate/reserve credits
        ↓
persist job
        ↓
enqueue immediately
        ↓
worker
```

Keep cron temporarily for:

- stuck-job recovery
- credit reconciliation
- cleanup
- maintenance

Migration should be reversible with a feature flag/kill switch.

Do not select or migrate to a new queue provider until #780–#782 establish the current root cause and the team evaluates current operational requirements/costs.

---

## 8. Credits

Related: #769, #440 and #441.

Required lifecycle:

```text
estimate
   ↓
reserve
   ↓
execute provider
   ↓
validate output
   ↓
persist
   ↓
reconcile actual credits
```

On eligible failure:

```text
provider/storage failure
        ↓
release/refund reservation
```

Never permanently charge an eligible failed generation and never double-charge a duplicate delivery.

Store a ledger link between user, generation, provider/model, estimated credits, actual credits and request/correlation ID.

---

## 9. Storage and repeated-image protection

Generated production images should use unique immutable keys, for example:

```text
users/{userId}/generations/{generationId}/image.png
```

Avoid mutable shared paths such as:

```text
generated/image.png
```

During diagnosis, direct base64/data URL output is useful only to prove Gemini works before storage. In production, decode/provider output → R2/object storage → persist unique asset reference → return asset URL/reference.

A provider failure must never be converted into a placeholder that appears to be a successful generation.

---

## 10. Polling and UI progress

**#787 — Reduce generation-status polling and add adaptive/realtime updates.**

Current repeated calls to `GET /api/ai/jobs/{id}` should be reduced.

Baseline:

- poll faster immediately after submission
- progressively back off for longer jobs
- stop immediately on `completed`, `failed` or `cancelled`
- reduce/stop polling when the tab is backgrounded where appropriate
- restore state after reconnect/refresh

Evaluate SSE/realtime updates if operationally justified.

UI should communicate real states such as:

```text
Waiting in queue…
Generating…
Saving…
Complete
```

instead of treating every delay as an error.

---

## 11. Stuck-job recovery

**#788 — Add stuck-job recovery and reconciliation sweeper.**

Scheduled recovery should:

- detect jobs beyond type-specific processing thresholds
- inspect provider status when a provider request ID exists
- retry/fail/recover deterministically
- release/reconcile reserved credits
- preserve audit/correlation data
- never double-submit or double-charge

Image, video and web jobs should have different operational timeout/recovery policies.

---

## 12. Image, video and web workloads

Do not assume all generation types behave the same.

### Image
Usually a relatively short provider call followed by storage/persistence.

### Video
May be provider-asynchronous:
```text
submit → provider job ID → provider processing → retrieve output
```
The worker/job model must support this without holding a browser request open.

### Web
May be multi-step:
```text
LLM/code generation → validation → build/sandbox → preview/output
```

The common GenerationJob contract should support these workflows while provider-specific adapters own their implementation details.

---

## 13. Observability

**#771 — Add production observability for Gemini image generation**, then generalize it to all generation types.

Current `errorCode: "Error"` is insufficient.

Desired structured event shape:

```json
{
  "level": "error",
  "category": "ai_generation",
  "operation": "provider_request_failed",
  "generationId": "gen_x",
  "correlationId": "corr_x",
  "provider": "google",
  "model": "<configured-model>",
  "httpStatus": 401,
  "providerErrorCode": "<safe-code>",
  "attempt": 1,
  "durationMs": 31,
  "retryable": false
}
```

Never log API keys, authorization headers, full base64 payloads or other secrets. Prompt/content logging must follow Prompt Studio privacy/telemetry policy.

Metrics should include:

- generation started/completed/failed
- success/failure by provider/model/type
- latency
- typed error category
- attempts/retries/dead-letter count
- storage result
- credits estimated/reserved/reconciled
- stuck/recovered jobs

---

## 14. Regression testing

**#770 — Gemini image-generation integration regression tests.**

Minimum distinct prompts:

1. orange cat running
2. red sports car in snow
3. astronaut on the moon

Tests should verify:

- valid image output structure
- unique generation ID
- unique storage key/reference
- placeholder cannot satisfy success
- no-image response handling
- provider failure handling
- retry/idempotency
- credit reconciliation
- concurrent duplicate processing safety

Avoid brittle visual-similarity assertions when structural/identity assertions are sufficient.

---

## 15. Complete execution checklist

Execute in this order:

- [ ] #780 identify the external 400/401 requests
- [ ] #781 verify Gemini Production credentials/environment/model
- [ ] #782 production-safe direct Gemini smoke test
- [ ] #758 verify production Gemini model
- [ ] #759 isolated Gemini test path
- [ ] #760 safe Gemini response metadata
- [ ] #761 fix response parsing
- [ ] #762 remove misleading fallback/placeholder success
- [ ] #763 prove direct image before storage
- [ ] #764 unique storage keys
- [ ] #765 fix stale caching
- [ ] #766 per-generation frontend state
- [ ] #767 fix global/inappropriate generation lock
- [ ] #768 typed errors
- [ ] #783 canonical GenerationJob
- [ ] #785 atomic claiming/idempotency
- [ ] #786 retries + dead-letter
- [ ] #784 immediate queue dispatch; cron becomes recovery/maintenance
- [ ] #769 / #440 / #441 credit reserve/reconcile/refund/duplicate safety
- [ ] #787 adaptive polling/realtime
- [ ] #788 stuck-job recovery/reconciliation
- [ ] #770 integration/regression tests
- [ ] #771 production observability

## 16. Development workflow

For each implementation task:

1. Inspect current implementation and reproduce/measure the issue.
2. Create a task-specific branch.
3. Implement only the scoped change.
4. Add/update tests.
5. Verify acceptance criteria.
6. Commit referencing the issue.
7. Open a separate pull request.
8. Document verification/results in the issue.
9. Close the issue only after acceptance criteria are met.

Do not merge unverified changes solely to advance the checklist.

---

## 17. Related GitHub work

Primary:
- #757 — Fix Gemini image generation end-to-end
- #779 — Diagnose 400/401 and harden async generation architecture
- #780–#788 — production diagnosis and queue architecture tasks

Existing work reused:
- #141 — generation workers outside web requests
- #142 — retries/backoff/dead-letter
- #145 — complete idempotency
- #237 — event deduplication/idempotency
- #437 — real job progress
- #439 — retry failed jobs
- #440 — prevent duplicate charges
- #441 — refund credits
- #448 — understandable errors
- #457 — queue states

## Decision gate

Do not make a hosting migration decision until:

1. #780 identifies the 400/401 sources.
2. #781 verifies Production authentication/configuration.
3. #782 proves whether direct Gemini generation succeeds.
4. The cost/operational needs of image, video and web workloads are measured.

The target architecture should allow Vercel to remain the web/API layer while generation workers/providers evolve independently.
