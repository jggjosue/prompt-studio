import { runAIJob } from '@/lib/ai-job-runner';
import { notifyJobFinished } from '@/lib/ai-job-service';
import { executionWorkloadForKind } from '@/lib/ai-execution-backend-policy';
import { captureGenerationCredits, releaseGenerationCredits } from '@/lib/generation-credit-boundary';
import { recordAssetProvenance } from '@/lib/asset-provenance-server';
import { gcpAccessToken } from '@/lib/gcp-access-token';
import { dispatchGcpGenerationTask } from '@/lib/gcp-generation-dispatch';
import {
  claimGenerationJob,
  claimExhaustedGenerationJob,
  GenerationJobOwnershipError,
  transitionGenerationJob,
  updateOwnedGenerationJob,
} from '@/lib/generation-job-state-server';
import {
  createGenerationJobProcessor,
  type GenerationWorkerContext,
  type GenerationWorkerDeps,
} from '@/lib/generation-worker-core';
import { finalizeModelRegressionForJob } from '@/lib/model-regression-server';
import { observeOperation, recordObservabilityEvent, reportOperationalError } from '@/lib/observability-server';
import { validateAndRepairOutput } from '@/lib/output-contract';
import { recordProjectFunnelEvent } from '@/lib/project-funnel-events';
import OutputContract from '@/models/OutputContract';
import type { IAIGenerationJob } from '@/models/AIGenerationJob';
import { captureGenerationLifecycleBestEffort } from '@/lib/training/capture';
import { externalizeGenerationAssets } from '@/lib/generation-assets';

export type { GenerationWorkerContext };

function defaultWorkerOwner() {
  if (process.env.K_REVISION) return `cloud-run:${process.env.K_REVISION}`;
  if (process.env.VERCEL_REGION) return `vercel:${process.env.VERCEL_REGION}`;
  return 'prompt-studio-local';
}

async function validateOutput(job: IAIGenerationJob) {
  if (!job.outputContractId) return;
  const contract = await OutputContract.findOne({ _id: job.outputContractId, userId: job.userId }).lean();
  if (!contract) throw new Error('El contrato de salida ya no está disponible.');
  // runProvider always sets a result before validation; guard keeps types honest.
  if (!job.result) throw new Error('El proveedor devolvió un resultado inválido.');
  const validation = validateAndRepairOutput(job.result, contract);
  job.outputValidation = { status: validation.status, errors: validation.errors.slice(0, 20), repaired: validation.repaired };
  if (validation.status === 'invalid') throw new Error(`El resultado incumple el contrato: ${validation.errors.slice(0, 3).join('; ')}`);
  job.result = { ...job.result, output: validation.value };
}

/** Next delivery for a job pinned to GCP (business retry / video poll). */
async function scheduleGcpFollowUp(job: IAIGenerationJob, input: { scheduleAt: Date; deliveryKey: string }) {
  const workload = executionWorkloadForKind(job.kind);
  if (job.executionBackend !== 'gcp' || !workload) return;
  const token = await gcpAccessToken();
  if (!token.ok) throw new Error(`GCP_FOLLOW_UP_TOKEN_${token.reason.toUpperCase()}`);
  // `force`: a job already pinned to GCP must keep draining even if new GCP
  // traffic was turned off; the kill switch still stops it.
  const result = await dispatchGcpGenerationTask(
    { jobId: String(job._id), correlationId: job.correlationId || String(job._id), workload, deliveryKey: input.deliveryKey, scheduleAt: input.scheduleAt },
    token.token,
    { force: true },
  );
  if (!claimed) {
    claimed = await claimExhaustedGenerationJob(claimInput);
    if (!claimed) return null;
    const exhausted = claimed.job;
    await releaseGenerationCredits(exhausted);
    const failed = await transitionGenerationJob({
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
    await notifyJobFinished(failed);
    await failed.save();
    return { id: String(failed._id), status: 'failed', recoveredExpiredLease: true };
  }
  let job = claimed.job;
  const { lockToken } = claimed;
  let currentState: GenerationJobState = 'processing';
  const generationStarted = performance.now();
  const observedProductId = typeof job.input.productId === 'string' ? job.input.productId.slice(0, 120) : String(job._id);
  try {
    job = await updateOwnedGenerationJob(String(job._id), lockToken, {
      progress: 35,
      progressMessage: 'Generando contenido',
    });
    captureGenerationLifecycleBestEffort(job, 'generation_started');
    job.result = await runAIJob(job);
    if (job.outputContractId) {
      const contract = await OutputContract.findOne({ _id: job.outputContractId, userId: job.userId }).lean();
      if (!contract) throw new Error('El contrato de salida ya no está disponible.');
      const validation = validateAndRepairOutput(job.result, contract);
      job.outputValidation = { status: validation.status, errors: validation.errors.slice(0, 20), repaired: validation.repaired };
      if (validation.status === 'invalid') throw new Error(`El resultado incumple el contrato: ${validation.errors.slice(0, 3).join('; ')}`);
      job.result = { ...job.result, output: validation.value };
    }
    // Binaries go to R2; the job keeps references only.
    const externalized = await externalizeGenerationAssets({ jobId: String(job._id), userId: job.userId, result: job.result });
    job.result = externalized.result ?? job.result;
    if (externalized.code) void recordObservabilityEvent({ category: 'ai_generation', name: 'generation_asset_externalize_failed', route: routeName, userId: job.userId, productId: observedProductId, status: 'degraded', metadata: { kind: job.kind, code: externalized.code, jobId: String(job._id) } });
    const quote = generationQuote(job.kind, job.provider);
    const resultMeta = job.result as Record<string, unknown>;
    const usage = providerUsage(job.result);
    job.actualInputTokens = usage.inputTokens;
    job.actualOutputTokens = usage.outputTokens;
    job.actualCostUsd = usage.costUsd ?? actualProviderCost(job.result);
    job.actualDurationMs = Math.round(performance.now() - generationStarted);
    job.outputResolution = typeof resultMeta.resolution === 'string' ? resultMeta.resolution.slice(0, 80) : quote.resolution;
    job.outputQuality = typeof resultMeta.quality === 'string' ? resultMeta.quality.slice(0, 80) : quote.quality;
    const providerRequestId = ['providerRequestId', 'requestId']
      .map(key => resultMeta[key])
      .find(value => typeof value === 'string');
    const assetRef = ['imageKey', 'assetKey', 'imageUrl', 'videoUrl']
      .map(key => resultMeta[key])
      .find(value => typeof value === 'string');
    const outputRef = ['outputUrl', 'projectUrl', 'downloadUrl', 'url']
      .map(key => resultMeta[key])
      .find(value => typeof value === 'string');
    job = await transitionGenerationJob({
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
        providerRequestId: typeof providerRequestId === 'string' ? providerRequestId.slice(0, 200) : null,
        assetRef: typeof assetRef === 'string' ? assetRef.slice(0, 500) : null,
        outputRef: typeof outputRef === 'string' ? outputRef.slice(0, 500) : null,
        progressMessage: 'Finalizando la creación',
        leaseExpiresAt: new Date(Date.now() + leaseMs),
      },
    });
    currentState = 'finalizing';
    await captureGenerationCredits(job);
    job = await transitionGenerationJob({
      jobId: String(job._id),
      from: currentState,
      to: 'completed',
      lockToken,
      patch: {
        progressMessage: 'Creación terminada',
        creditsState: job.creditsState,
        creditsCharged: job.creditsCharged ?? null,
        lastError: null,
        errorCategory: null,
      },
    });
    currentState = 'completed';
    await notifyJobFinished(job);
    await job.save();
    await recordAssetProvenance(job).catch(() => undefined);
    captureGenerationLifecycleBestEffort(job, 'generation_completed');
    if (job.projectId) await recordProjectFunnelEvent({ userId: job.userId, projectId: job.projectId, stage: 'first_generation', occurredAt: job.completedAt || new Date(), sourceId: String(job._id) }).catch(() => undefined);
    await finalizeModelRegressionForJob(String(job._id)).catch(() => undefined);
      void recordObservabilityEvent({ category: 'ai_generation', name: 'generation_completed', route: routeName, userId: job.userId, productId: observedProductId, status: 'completed', durationMs: Math.round(performance.now() - generationStarted), costUsd: job.estimatedCostUsd, value: job.creditCost, unit: 'credits', metadata: { operation: 'generate', kind: job.kind, provider: job.provider, modelId: job.modelId, attempts: job.attempts, jobId: String(job._id), correlationId: job.correlationId || String(job._id) } });
  } catch (error) {
    const durationMs = Math.round(performance.now() - generationStarted);
    if (error instanceof GenerationJobOwnershipError) {
      reportOperationalError({ category: 'ai_generation', name: 'generation_ownership_lost', route: routeName, userId: job.userId, productId: observedProductId, durationMs, metadata: { operation: 'transition', kind: job.kind, provider: job.provider, modelId: job.modelId, attempts: job.attempts, jobId: String(job._id), correlationId: job.correlationId || String(job._id) } }, error);
      return { id: String(job._id), status: currentState, ownershipLost: true };
    }
    if (currentState === 'completed') {
      reportOperationalError({ category: 'ai_generation', name: 'generation_post_completion_error', route: routeName, userId: job.userId, productId: observedProductId, durationMs, metadata: { operation: 'post_completion', kind: job.kind, provider: job.provider, modelId: job.modelId, attempts: job.attempts, jobId: String(job._id), correlationId: job.correlationId || String(job._id) } }, error);
      return { id: String(job._id), status: currentState };
    }
    const lastError = error instanceof Error ? error.message.slice(0, 500) : 'Error desconocido del proveedor.';
    const httpStatus = providerHttpStatus(error);
    const errorCode = safeErrorCode(error);
    const errorCategory = generationJobErrorCategory({
      httpStatus,
      code: errorCode,
      message: lastError,
    });
    const retry = generationRetryDecision({ category: errorCategory, attempt: job.attempts, maxAttempts: job.maxAttempts });
    const failureMetadata = {
      category: errorCategory,
      code: errorCode || null,
      httpStatus,
      retryable: retry.retryable,
      attempt: job.attempts,
      occurredAt: new Date(),
    };
    if (retry.action === 'retry') {
      job = await transitionGenerationJob({
        jobId: String(job._id),
        from: currentState,
        to: 'queued',
        lockToken,
        patch: {
          progressMessage: `Reintento ${job.attempts + 1} de ${job.maxAttempts}`,
          nextAttemptAt: retry.nextAttemptAt,
          lastError,
          errorCategory,
          retryable: true,
          failureMetadata,
        },
      });
      currentState = 'queued';
      reportOperationalError({ category: 'ai_generation', name: 'generation_retry_scheduled', route: routeName, userId: job.userId, productId: observedProductId, durationMs, costUsd: job.estimatedCostUsd, value: job.creditCost, unit: 'credits', metadata: { operation: 'generate', kind: job.kind, provider: job.provider, modelId: job.modelId, attempts: job.attempts, jobId: String(job._id), correlationId: job.correlationId || String(job._id) } }, error);
    } else {
      await releaseGenerationCredits(job);
      job = await transitionGenerationJob({
        jobId: String(job._id),
        from: currentState,
        to: 'dead_letter',
        lockToken,
        patch: {
          progressMessage: retry.retryable
            ? 'La generación agotó sus intentos y requiere revisión'
            : 'La generación requiere corregir su configuración antes de reprocesarla',
          lastError,
          errorCategory,
          retryable: retry.retryable,
          failureMetadata,
          actualDurationMs: durationMs,
          actualCostUsd: null,
          creditsState: job.creditsState,
        },
      });
      currentState = 'dead_letter';
      await notifyJobFinished(job);
      await job.save();
      captureGenerationLifecycleBestEffort(job, 'generation_failed');
      reportOperationalError({ category: 'ai_generation', name: 'generation_dead_lettered', route: routeName, userId: job.userId, productId: observedProductId, durationMs, costUsd: job.estimatedCostUsd, value: job.creditCost, unit: 'credits', metadata: { operation: 'generate', kind: job.kind, provider: job.provider, modelId: job.modelId, attempts: job.attempts, jobId: String(job._id), correlationId: job.correlationId || String(job._id), errorCategory, retryable: retry.retryable } }, error);
    }
    if (currentState === 'dead_letter') await finalizeModelRegressionForJob(String(job._id)).catch(() => undefined);
  }
  return { id: String(job._id), status: currentState };
}

/**
 * Shared generation runtime used by the Vercel process route, the Cloud Run
 * worker and the AWS worker. Provider execution, credit reconciliation and
 * retry policy (generationRetryDecision) live in generation-worker-core; this
 * module only wires the production dependencies (runAIJob,
 * captureGenerationCredits, releaseGenerationCredits, claimGenerationJob...).
 */
export const processGenerationJob = createGenerationJobProcessor(deps);
