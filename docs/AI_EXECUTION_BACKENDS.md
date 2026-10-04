# AI execution backends (multi-cloud selector)

Issue: #835 (EPIC #827). Code: `src/lib/ai-execution-backend-policy.ts`.

## Two layers that must not be confused

| Layer | Examples | Where it lives |
|---|---|---|
| **AI provider / model** | Google Gemini/Veo, OpenAI, Runway, Kling, Fal | `job.provider`, `job.modelId`, provider adapters |
| **Execution backend** (queue + compute) | legacy (Vercel + QStash/cron), GCP (Cloud Tasks + Cloud Run), AWS, Cloudflare | `AI_EXECUTION_BACKEND` + per-cloud flags, pinned on the job |

Switching the execution backend never changes the provider/model, prompt, pricing or credits.

Cloudflare **R2 storage** is unrelated to the Cloudflare *execution* backend:
`CLOUDFLARE_AI_DISPATCH_ENABLED=false` does not disable R2.

## Selector

`AI_EXECUTION_BACKEND = legacy | gcp | aws | cloudflare | recovery` (unset ⇒ `legacy`).

A cloud backend is chosen only when **all** of these hold, otherwise the job stays on `legacy`:

1. `AI_EXECUTION_BACKEND` names that cloud (unknown values ⇒ `invalid_selector` ⇒ legacy);
2. only one cloud has `<PREFIX>_DISPATCH_ENABLED=true` (two or more ⇒ `ambiguous_configuration`);
3. `<PREFIX>_KILL_SWITCH` is not `true`;
4. `<PREFIX>_DISPATCH_ENABLED=true`;
5. `<PREFIX>_<WORKLOAD>_ENABLED=true` for the job's workload (image / video / web);
6. the backend has an enqueue adapter in code (today only GCP; AWS/Cloudflare ⇒ `adapter_not_implemented`);
7. its required non-secret identifiers are present (else `configuration_missing`).

Only Image, Video and Web (`kind: project`) are eligible. Text, vision and video-understanding always stay on legacy.

`recovery` means "do not dispatch immediately"; for new jobs it behaves like legacy, whose cron is the recovery loop.

| Prefix | Flags (all `false` in `.env.example`) | Required identifiers |
|---|---|---|
| `GCP_AI` | DISPATCH_ENABLED, KILL_SWITCH, IMAGE/VIDEO/WEB_ENABLED | PROJECT_ID, REGION, WORKER_URL, QUEUE_INVOKER_SERVICE_ACCOUNT |
| `AWS_AI` | same | REGION, IMAGE/VIDEO/WEB_QUEUE_URL |
| `CLOUDFLARE_AI` | same | ACCOUNT_ID, IMAGE/VIDEO/WEB_QUEUE_ID |

## Exactly one backend per job

The selection is made once, when the job is created, and pinned on the job.
Retries and recovery reuse the pinned backend. A flag flip mid-flight therefore cannot move a job to a second backend, and workers only execute jobs pinned to their own backend (`workerMayExecute`).

Never: QStash + GCP, GCP + AWS, AWS + Cloudflare, or any other pair for the same job.

## Dispatch flow (implemented in #835 part 2)

```
validate → price → selectExecutionBackend() → persist AIGenerationJob{executionBackend}
→ reserve Prompt Credits → dispatchPinnedGenerationJob() → exactly ONE adapter → 202 {job, dispatch}
```

- The selection is pure config, so it is computed just before the insert and stored atomically with the job.
  Enqueue still happens strictly after the credit reservation.
- `legacy` → existing `dispatchGenerationJob` (QStash when `AI_QUEUE_DISPATCH_ENABLED=true`, otherwise processing is triggered by the client hook / recovery).
- `gcp` → Cloud Tasks (`dispatchGcpGenerationTask`) → private Cloud Run `/tasks/generation` with an OIDC token for `ps-ai-queue-invoker`.
- A failed cloud enqueue **stays pinned** (`dispatch.state = failed`) and is retried on the same backend with the same deterministic task name. It is never re-routed to QStash, because an enqueue with an unknown outcome could otherwise run twice.
- `AIGenerationJob.dispatch` persists: backend/transport, queue, task or message id, `dispatchedAt`, `correlationId`, workload, state, reason, attempts.
- Claims are scoped by `executionBackend`: legacy claimers (process route) only take `legacy`/unset jobs; the Cloud Run worker only `gcp` jobs, and it also checks that the payload workload/correlationId match MongoDB.

Payload (Cloud Tasks body): `{ "version": 1, "jobId", "correlationId", "workload" }` — no prompt, keys, credentials, email, balances or media.

### Enqueue identity (no JSON keys)
- Vercel: per-request Vercel OIDC token (`x-vercel-oidc-token`) → Google STS (Workload Identity Federation, `GCP_AI_WIF_PROVIDER`) → impersonate `GCP_AI_DISPATCHER_SERVICE_ACCOUNT` (`ps-ai-dispatcher`: `roles/cloudtasks.enqueuer` on the three queues + `roles/iam.serviceAccountUser` on `ps-ai-queue-invoker`).
- Cloud Run worker (follow-up deliveries: business retry, video poll): metadata-server token of `ps-ai-worker`, same two roles.

## Current state

All cloud backends are **OFF**. `legacy` is the only active path.
Activation, canary and rollback steps: `docs/GCP_ACTIVATION_RUNBOOK.md` (added with the canary-prep task).
