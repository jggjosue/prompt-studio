import { actualProviderCost, generationQuote, providerUsage } from '@/lib/generation-pricing';
import { generationJobErrorCategory, type GenerationJobErrorCategory, type GenerationJobState } from '@/lib/generation-job-state';
import { generationRetryDecision } from '@/lib/generation-retry-policy';
import { safeErrorCode } from '@/lib/observability-safety';
import { networkErrorCode, providerHttpStatus } from '@/lib/provider-error-safety';
import type { IAIGenerationJob } from '@/models/AIGenerationJob';

/**
 * Backend-agnostic generation job processor (#831 runtime, #836 safety).
 *
 * Every execution backend (Vercel legacy, Cloud Run, future AWS/Cloudflare)
 * runs this same function; only the injected dependencies differ. Safety
 * invariants enforced here:
 *  - a job is executed only by the holder of a fresh atomic claim (lease +
 *    random lock token), so a duplicate delivery cannot start a second run;
 *  - credits are captured only after a successful finalize transition and
 *    released only on a terminal failure, each through the idempotent ledger
 *    boundary (`capture`/`release`), never twice on the same path;
 *  - provider/business retries live here (attempts/nextAttemptAt). The queue
 *    transport only retries infrastructure failures (non-2xx), so the same
 *    error never feeds two exponential retry loops.
 *
 * No `server-only`, no DB or provider imports: everything with side effects is
 * injected, which is what makes the duplicate-delivery and crash tests possible.
 */

export type ExecutionBackendName = 'legacy' | 'gcp' | 'aws' | 'cloudflare';

export type GenerationWorkerContext = {
  routeName?: string;
  owner?: string;
  /** Backend this worker runs on; it only claims jobs pinned to it (#835). */
  executionBackend?: ExecutionBackendName;
};

export type WorkerClaimInput = {
  owner: string;
  leaseMs: number;
  userId?: string;
  jobId?: string;
  executionBackend: ExecutionBackendName;
};

type Claimed = { job: IAIGenerationJob; lockToken: string };

type ObservedEvent = {
  category: 'ai_generation';
  name: string;
  route: string;
  userId?: string;
  productId?: string;
  status?: string;
  durationMs?: number;
  costUsd?: number;
  value?: number;
  unit?: string;
  metadata?: Record<string, unknown>;
};

/**
 * Provider adapter for long-running generations (video, #833). The worker
 * never keeps an HTTP request open until the provider finishes: it submits,
 * persists the provider's operation id, polls for a bounded time, and if the
 * work is still running it schedules a delayed delivery and lets go.
 */
export type LongRunningOperationAdapter = {
  name: string;
  /**
   * true only if the provider honours our submission key (Idempotency-Key),
   * so re-submitting after an ambiguous crash cannot create a second job.
   */
  idempotentSubmit: boolean;
  submit(job: IAIGenerationJob, submissionKey: string): Promise<{ providerRequestId: string }>;
  poll(job: IAIGenerationJob, providerRequestId: string): Promise<
    | { state: 'pending' }
    | { state: 'succeeded'; result: Record<string, unknown> }
    | { state: 'failed'; error: Error }
  >;
};

export type LongRunningConfig = {
  adapterFor(job: IAIGenerationJob): LongRunningOperationAdapter | null;
  pollIntervalMs: number;
  /** Max time one delivery spends polling before handing back to the queue. */
  pollBudgetMs: number;
  /** Hard cap from submission; after it the job is closed and refunded. */
  maxOperationMs: number;
  sleep(ms: number): Promise<void>;
};

type ProviderOperation = NonNullable<IAIGenerationJob['providerOperation']>;

export const VIDEO_SUBMISSION_AMBIGUOUS = 'VIDEO_SUBMISSION_AMBIGUOUS';
export const VIDEO_OPERATION_EXPIRED = 'VIDEO_OPERATION_EXPIRED';

export type GenerationWorkerDeps = {
  claim(input: WorkerClaimInput): Promise<Claimed | null>;
  claimExhausted(input: WorkerClaimInput): Promise<Claimed | null>;
  transition(input: { jobId: string; from: GenerationJobState; to: GenerationJobState; lockToken?: string; patch?: Record<string, unknown> }): Promise<IAIGenerationJob>;
  updateOwned(jobId: string, lockToken: string, patch: Record<string, unknown>): Promise<IAIGenerationJob>;
  isOwnershipError(error: unknown): boolean;
  /** Provider call. Must reuse the job's stable submission key on every attempt. */
  runProvider(job: IAIGenerationJob): Promise<Record<string, unknown>>;
  /** Best-effort hook when a provider run begins (not on video poll resumes). */
  onStarted?(job: IAIGenerationJob): void;
  /** Output-contract validation; throws on invalid output, may repair it. */
  validateOutput(job: IAIGenerationJob): Promise<void>;
  capture(job: IAIGenerationJob): Promise<void>;
  release(job: IAIGenerationJob): Promise<void>;
  notifyFinished(job: IAIGenerationJob): Promise<void>;
  persist(job: IAIGenerationJob): Promise<void>;
  /** Best-effort side effects after completion (provenance, funnel...). */
  afterCompleted(job: IAIGenerationJob): Promise<void>;
  finalizeRegression(jobId: string): Promise<void>;
  /**
   * Enqueue the next delivery of a job that stays pinned to a cloud backend
   * (business retry). Legacy omits it: its processor/recovery picks the job up.
   */
  scheduleFollowUp?(job: IAIGenerationJob, input: { scheduleAt: Date; deliveryKey: string; reason: 'retry' | 'poll' }): Promise<void>;
  /** Structured execution record (#837); must never throw. */
  logExecution?(input: {
    job: IAIGenerationJob;
    outcome: 'completed' | 'retry_scheduled' | 'poll_scheduled' | 'dead_letter' | 'failed' | 'ownership_lost';
    executionBackend: ExecutionBackendName;
    latencyMs: number | null;
    error?: { category: string; code: string; httpStatus: number | null } | null;
  }): void;
  /** Long-running (video) support. Only used on non-legacy backends. */
  longRunning?: LongRunningConfig;
  observeClaim<T>(route: string, run: () => Promise<T>): Promise<T>;
  recordEvent(event: ObservedEvent): void;
  reportError(event: ObservedEvent, error: unknown): void;
  defaultOwner(): string;
  clock?: { now(): number; perf(): number };
};

export type GenerationProcessResult =
  | { id: string; status: GenerationJobState; recoveredExpiredLease?: boolean; ownershipLost?: boolean }
  | null;

export function classifyGenerationError(error: unknown): {
  category: GenerationJobErrorCategory;
  code: string;
  httpStatus: number | null;
  message: string;
} {
  const message = error instanceof Error ? error.message.slice(0, 500) : 'Error desconocido del proveedor.';
  const httpStatus = providerHttpStatus(error);
  const code = networkErrorCode(error) ?? safeErrorCode(error);
  return { category: generationJobErrorCategory({ httpStatus, code, message }), code, httpStatus, message };
}

export function createGenerationJobProcessor(deps: GenerationWorkerDeps) {
  const clock = deps.clock ?? { now: () => Date.now(), perf: () => performance.now() };

  type LongRunningOutcome =
    | { kind: 'result'; job: IAIGenerationJob; result: Record<string, unknown> }
    | { kind: 'pending'; job: IAIGenerationJob; pollCount: number };

  async function runLongRunning(initial: IAIGenerationJob, lockToken: string, adapter: LongRunningOperationAdapter, cfg: LongRunningConfig): Promise<LongRunningOutcome> {
    let job = initial;
    const jobId = String(job._id);
    const at = () => new Date(clock.now());
    let op: ProviderOperation | null = job.providerOperation ? { ...job.providerOperation } : null;

    if (!op?.providerRequestId) {
      // A previous delivery may have died between "provider accepted" and
      // "id persisted". Without provider-side idempotency we cannot know, and
      // re-submitting could generate (and pay for) a second video.
      if (op?.status === 'submitting' && !adapter.idempotentSubmit) {
        throw Object.assign(new Error('No se puede confirmar si el proveedor aceptó el video; requiere conciliación manual.'), { code: VIDEO_SUBMISSION_AMBIGUOUS });
      }
      const submissionKey = op?.submissionKey || job.generationIdempotencyKey || jobId;
      op = { status: 'submitting', provider: job.provider, modelId: job.modelId ?? null, providerRequestId: null, submissionKey, attempt: job.attempts, pollCount: 0, submittingAt: at(), submittedAt: null, lastPolledAt: null, completedAt: null };
      job = await deps.updateOwned(jobId, lockToken, { providerOperation: op });
      let submitted: { providerRequestId: string };
      try {
        submitted = await adapter.submit(job, submissionKey);
      } catch (error) {
        // An HTTP answer means the provider did not take the job: safe to clear
        // so a retry submits again. A transport error stays ambiguous.
        if (providerHttpStatus(error) !== null) await deps.updateOwned(jobId, lockToken, { providerOperation: null });
        throw error;
      }
      op = { ...op, status: 'submitted', providerRequestId: submitted.providerRequestId.slice(0, 300), submittedAt: at() };
      job = await deps.updateOwned(jobId, lockToken, { providerOperation: op, providerRequestId: op.providerRequestId!.slice(0, 200) });
    }

    const startedAt = (op.submittedAt ?? op.submittingAt ?? at()).getTime();
    const budgetEnd = clock.now() + cfg.pollBudgetMs;
    for (;;) {
      const polled = await adapter.poll(job, op.providerRequestId!);
      op = { ...op, pollCount: op.pollCount + 1, lastPolledAt: at() };
      if (polled.state === 'succeeded') {
        op = { ...op, status: 'succeeded', completedAt: at() };
        job = await deps.updateOwned(jobId, lockToken, { providerOperation: op });
        return { kind: 'result', job, result: { ...polled.result, providerRequestId: op.providerRequestId } };
      }
      if (polled.state === 'failed') {
        op = { ...op, status: 'failed', completedAt: at() };
        job = await deps.updateOwned(jobId, lockToken, { providerOperation: op });
        throw polled.error;
      }
      job = await deps.updateOwned(jobId, lockToken, { providerOperation: op });
      if (clock.now() - startedAt >= cfg.maxOperationMs) {
        throw Object.assign(new Error('La operación de video superó su duración máxima.'), { code: VIDEO_OPERATION_EXPIRED });
      }
      if (clock.now() + cfg.pollIntervalMs > budgetEnd) return { kind: 'pending', job, pollCount: op.pollCount };
      await cfg.sleep(cfg.pollIntervalMs);
    }
  }

  return async function processGenerationJob(userId?: string, leaseMinutes = 5, jobId?: string, context: GenerationWorkerContext = {}): Promise<GenerationProcessResult> {
    const routeName = context.routeName || '/api/ai/jobs/process';
    const executionBackend = context.executionBackend ?? 'legacy';
    const leaseMs = leaseMinutes * 60_000;
    const claimInput: WorkerClaimInput = { owner: context.owner || deps.defaultOwner(), leaseMs, userId, jobId, executionBackend };

    let claimed = await deps.observeClaim(routeName, () => deps.claim(claimInput));
    if (!claimed) {
      claimed = await deps.claimExhausted(claimInput);
      if (!claimed) return null;
      const exhausted = claimed.job;
      await deps.release(exhausted);
      const failed = await deps.transition({
        jobId: String(exhausted._id),
        from: 'processing',
        to: 'failed',
        lockToken: claimed.lockToken,
        patch: {
          progressMessage: 'La generación agotó sus intentos y los créditos fueron devueltos',
          lastError: exhausted.lastError || 'El worker perdió su lease en el último intento.',
          errorCategory: exhausted.errorCategory || 'unknown',
          creditsState: exhausted.creditsState,
        },
      });
      await deps.notifyFinished(failed);
      await deps.persist(failed);
      deps.logExecution?.({ job: failed, outcome: 'failed', executionBackend, latencyMs: null });
      return { id: String(failed._id), status: 'failed', recoveredExpiredLease: true };
    }

    let job = claimed.job;
    const { lockToken } = claimed;
    let currentState: GenerationJobState = 'processing';
    const generationStarted = clock.perf();
    const observedProductId = typeof job.input.productId === 'string' ? job.input.productId.slice(0, 120) : String(job._id);
    const meta = () => ({ kind: job.kind, provider: job.provider, modelId: job.modelId, attempts: job.attempts, jobId: String(job._id), correlationId: job.correlationId || String(job._id), executionBackend });
    try {
      job = await deps.updateOwned(String(job._id), lockToken, { progress: 35, progressMessage: 'Generando contenido' });
      if (!job.providerOperation) deps.onStarted?.(job);
      const adapter = executionBackend !== 'legacy' && deps.longRunning ? deps.longRunning.adapterFor(job) : null;
      if (adapter && deps.longRunning) {
        const outcome = await runLongRunning(job, lockToken, adapter, deps.longRunning);
        job = outcome.job;
        if (outcome.kind === 'pending') {
          // Still rendering: release the worker, keep the reservation, and come
          // back later. Polling does not consume provider attempts.
          const nextPollAt = new Date(clock.now() + deps.longRunning.pollIntervalMs);
          job = await deps.transition({
            jobId: String(job._id),
            from: currentState,
            to: 'queued',
            lockToken,
            patch: { attempts: Math.max(0, job.attempts - 1), nextAttemptAt: nextPollAt, progressMessage: 'Generando video con el proveedor', lastError: null },
          });
          currentState = 'queued';
          if (deps.scheduleFollowUp) {
            await deps.scheduleFollowUp(job, { scheduleAt: nextPollAt, deliveryKey: `poll-${outcome.pollCount}`, reason: 'poll' }).catch(followUpError => {
              deps.reportError({ category: 'ai_generation', name: 'generation_follow_up_enqueue_failed', route: routeName, userId: job.userId, productId: observedProductId, metadata: meta() }, followUpError);
            });
          }
          deps.logExecution?.({ job, outcome: 'poll_scheduled', executionBackend, latencyMs: Math.round(clock.perf() - generationStarted) });
          deps.recordEvent({ category: 'ai_generation', name: 'generation_poll_scheduled', route: routeName, userId: job.userId, productId: observedProductId, status: 'queued', metadata: { ...meta(), providerRequestId: job.providerRequestId ?? null } });
          return { id: String(job._id), status: currentState };
        }
        job.result = outcome.result;
      } else {
        job.result = await deps.runProvider(job);
      }
      await deps.validateOutput(job);
      const quote = generationQuote(job.kind, job.provider);
      const resultMeta = job.result as Record<string, unknown>;
      const usage = providerUsage(job.result);
      job.actualInputTokens = usage.inputTokens;
      job.actualOutputTokens = usage.outputTokens;
      job.actualCostUsd = usage.costUsd ?? actualProviderCost(job.result);
      job.actualDurationMs = Math.round(clock.perf() - generationStarted);
      job.outputResolution = typeof resultMeta.resolution === 'string' ? resultMeta.resolution.slice(0, 80) : quote.resolution;
      job.outputQuality = typeof resultMeta.quality === 'string' ? resultMeta.quality.slice(0, 80) : quote.quality;
      const providerRequestId = ['providerRequestId', 'requestId'].map(key => resultMeta[key]).find(value => typeof value === 'string');
      const assetRef = ['imageKey', 'assetKey', 'imageUrl', 'videoUrl'].map(key => resultMeta[key]).find(value => typeof value === 'string');
      const outputRef = ['outputUrl', 'projectUrl', 'downloadUrl', 'url'].map(key => resultMeta[key]).find(value => typeof value === 'string');
      job = await deps.transition({
        jobId: String(job._id),
        from: currentState,
        to: 'finalizing',
        lockToken,
        patch: {
          result: job.result,
          outputValidation: job.outputValidation ?? null,
          actualInputTokens: job.actualInputTokens,
          actualOutputTokens: job.actualOutputTokens,
          actualCostUsd: job.actualCostUsd,
          actualDurationMs: job.actualDurationMs,
          outputResolution: job.outputResolution,
          outputQuality: job.outputQuality,
          providerRequestId: typeof providerRequestId === 'string' ? providerRequestId.slice(0, 200) : (job.providerRequestId ?? null),
          assetRef: typeof assetRef === 'string' ? assetRef.slice(0, 500) : null,
          outputRef: typeof outputRef === 'string' ? outputRef.slice(0, 500) : null,
          progressMessage: 'Finalizando la creación',
          leaseExpiresAt: new Date(clock.now() + leaseMs),
        },
      });
      currentState = 'finalizing';
      await deps.capture(job);
      job = await deps.transition({
        jobId: String(job._id),
        from: currentState,
        to: 'completed',
        lockToken,
        patch: { progressMessage: 'Creación terminada', creditsState: job.creditsState, creditsCharged: job.creditsCharged ?? null, lastError: null, errorCategory: null },
      });
      currentState = 'completed';
      await deps.notifyFinished(job);
      await deps.persist(job);
      await deps.afterCompleted(job).catch(() => undefined);
      await deps.finalizeRegression(String(job._id)).catch(() => undefined);
      deps.logExecution?.({ job, outcome: 'completed', executionBackend, latencyMs: job.actualDurationMs ?? null });
      deps.recordEvent({ category: 'ai_generation', name: 'generation_completed', route: routeName, userId: job.userId, productId: observedProductId, status: 'completed', durationMs: Math.round(clock.perf() - generationStarted), costUsd: job.estimatedCostUsd, value: job.creditCost, unit: 'credits', metadata: { operation: 'generate', ...meta() } });
    } catch (error) {
      const durationMs = Math.round(clock.perf() - generationStarted);
      if (deps.isOwnershipError(error)) {
        deps.logExecution?.({ job, outcome: 'ownership_lost', executionBackend, latencyMs: durationMs });
        deps.reportError({ category: 'ai_generation', name: 'generation_ownership_lost', route: routeName, userId: job.userId, productId: observedProductId, durationMs, metadata: { operation: 'transition', ...meta() } }, error);
        return { id: String(job._id), status: currentState, ownershipLost: true };
      }
      if (currentState === 'completed') {
        deps.reportError({ category: 'ai_generation', name: 'generation_post_completion_error', route: routeName, userId: job.userId, productId: observedProductId, durationMs, metadata: { operation: 'post_completion', ...meta() } }, error);
        return { id: String(job._id), status: currentState };
      }
      const failure = classifyGenerationError(error);
      const retry = generationRetryDecision({ category: failure.category, attempt: job.attempts, maxAttempts: job.maxAttempts, now: new Date(clock.now()) });
      const failureMetadata = { category: failure.category, code: failure.code || null, httpStatus: failure.httpStatus, retryable: retry.retryable, attempt: job.attempts, occurredAt: new Date(clock.now()) };
      if (retry.action === 'retry') {
        job = await deps.transition({
          jobId: String(job._id),
          from: currentState,
          to: 'queued',
          lockToken,
          patch: { progressMessage: `Reintento ${job.attempts + 1} de ${job.maxAttempts}`, nextAttemptAt: retry.nextAttemptAt, lastError: failure.message, errorCategory: failure.category, retryable: true, failureMetadata },
        });
        currentState = 'queued';
        deps.logExecution?.({ job, outcome: 'retry_scheduled', executionBackend, latencyMs: durationMs, error: failure });
        deps.reportError({ category: 'ai_generation', name: 'generation_retry_scheduled', route: routeName, userId: job.userId, productId: observedProductId, durationMs, costUsd: job.estimatedCostUsd, value: job.creditCost, unit: 'credits', metadata: { operation: 'generate', ...meta(), errorCategory: failure.category, httpStatus: failure.httpStatus } }, error);
        // Single retry loop: the next attempt is one delayed delivery on the
        // SAME backend. The transport saw a 2xx and will not retry on its own.
        if (deps.scheduleFollowUp && executionBackend !== 'legacy') {
          await deps.scheduleFollowUp(job, { scheduleAt: retry.nextAttemptAt, deliveryKey: `attempt-${job.attempts + 1}`, reason: 'retry' }).catch(followUpError => {
            // The job is durable in `queued`; recovery re-dispatches it.
            deps.reportError({ category: 'ai_generation', name: 'generation_follow_up_enqueue_failed', route: routeName, userId: job.userId, productId: observedProductId, metadata: meta() }, followUpError);
          });
        }
      } else {
        await deps.release(job);
        job = await deps.transition({
          jobId: String(job._id),
          from: currentState,
          to: 'dead_letter',
          lockToken,
          patch: {
            progressMessage: retry.retryable ? 'La generación agotó sus intentos y requiere revisión' : 'La generación requiere corregir su configuración antes de reprocesarla',
            lastError: failure.message,
            errorCategory: failure.category,
            retryable: retry.retryable,
            failureMetadata,
            actualDurationMs: durationMs,
            actualCostUsd: null,
            creditsState: job.creditsState,
          },
        });
        currentState = 'dead_letter';
        await deps.notifyFinished(job);
        await deps.persist(job);
        deps.logExecution?.({ job, outcome: 'dead_letter', executionBackend, latencyMs: durationMs, error: failure });
        deps.reportError({ category: 'ai_generation', name: 'generation_dead_lettered', route: routeName, userId: job.userId, productId: observedProductId, durationMs, costUsd: job.estimatedCostUsd, value: job.creditCost, unit: 'credits', metadata: { operation: 'generate', ...meta(), errorCategory: failure.category, retryable: retry.retryable, httpStatus: failure.httpStatus } }, error);
      }
      if (currentState === 'dead_letter') await deps.finalizeRegression(String(job._id)).catch(() => undefined);
    }
    return { id: String(job._id), status: currentState };
  };
}
