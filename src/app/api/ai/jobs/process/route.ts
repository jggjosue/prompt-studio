import { runAIJob } from '@/lib/ai-job-runner';
import { captureCredits, notifyJobFinished, refundCredits } from '@/lib/ai-job-service';
import { hasValidCronSecret } from '@/lib/api-auth';
import { recordAssetProvenance } from '@/lib/asset-provenance-server';
import { cacheHeaders } from '@/lib/cache-policy';
import { actualProviderCost, generationQuote, providerUsage } from '@/lib/generation-pricing';
import { generationJobErrorCategory, type GenerationJobState } from '@/lib/generation-job-state';
import { verifyGenerationQueueRequest } from '@/lib/generation-queue-dispatch';
import {
  claimGenerationJob,
  GenerationJobOwnershipError,
  transitionGenerationJob,
  updateOwnedGenerationJob,
} from '@/lib/generation-job-state-server';
import { finalizeModelRegressionForJob } from '@/lib/model-regression-server';
import connectToDatabase from '@/lib/mongoose';
import { observeOperation, recordObservabilityEvent, reportOperationalError } from '@/lib/observability-server';
import { validateAndRepairOutput } from '@/lib/output-contract';
import { recordProjectFunnelEvent } from '@/lib/project-funnel-events';
import { safeErrorCode } from '@/lib/observability-safety';
import { providerHttpStatus } from '@/lib/provider-error-safety';
import OutputContract from '@/models/OutputContract';
import { auth } from '@clerk/nextjs/server';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';

export const maxDuration = 300;

async function processOne(userId?: string, leaseMinutes = 5, jobId?: string) {
  const leaseMs = leaseMinutes * 60_000;
  const claimed = await observeOperation(
    { category: 'slow_query', name: 'ai_job_claim', route: '/api/ai/jobs/process' },
    () => claimGenerationJob({
      owner: process.env.VERCEL_REGION ? `vercel:${process.env.VERCEL_REGION}` : 'prompt-studio-local',
      leaseMs,
      userId,
      jobId,
    }),
  );
  if (!claimed) return null;
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
    job.result = await runAIJob(job);
    if (job.outputContractId) {
      const contract = await OutputContract.findOne({ _id: job.outputContractId, userId: job.userId }).lean();
      if (!contract) throw new Error('El contrato de salida ya no está disponible.');
      const validation = validateAndRepairOutput(job.result, contract);
      job.outputValidation = { status: validation.status, errors: validation.errors.slice(0, 20), repaired: validation.repaired };
      if (validation.status === 'invalid') throw new Error(`El resultado incumple el contrato: ${validation.errors.slice(0, 3).join('; ')}`);
      job.result = { ...job.result, output: validation.value };
    }
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
    await captureCredits(job);
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
    if (job.projectId) await recordProjectFunnelEvent({ userId: job.userId, projectId: job.projectId, stage: 'first_generation', occurredAt: job.completedAt || new Date(), sourceId: String(job._id) }).catch(() => undefined);
    await finalizeModelRegressionForJob(String(job._id)).catch(() => undefined);
      void recordObservabilityEvent({ category: 'ai_generation', name: 'generation_completed', route: '/api/ai/jobs/process', userId: job.userId, productId: observedProductId, status: 'completed', durationMs: Math.round(performance.now() - generationStarted), costUsd: job.estimatedCostUsd, value: job.creditCost, unit: 'credits', metadata: { operation: 'generate', kind: job.kind, provider: job.provider, modelId: job.modelId, attempts: job.attempts, jobId: String(job._id), correlationId: job.correlationId || String(job._id) } });
  } catch (error) {
    const durationMs = Math.round(performance.now() - generationStarted);
    if (error instanceof GenerationJobOwnershipError) {
      reportOperationalError({ category: 'ai_generation', name: 'generation_ownership_lost', route: '/api/ai/jobs/process', userId: job.userId, productId: observedProductId, durationMs, metadata: { operation: 'transition', kind: job.kind, provider: job.provider, modelId: job.modelId, attempts: job.attempts, jobId: String(job._id), correlationId: job.correlationId || String(job._id) } }, error);
      return { id: String(job._id), status: currentState, ownershipLost: true };
    }
    if (currentState === 'completed') {
      reportOperationalError({ category: 'ai_generation', name: 'generation_post_completion_error', route: '/api/ai/jobs/process', userId: job.userId, productId: observedProductId, durationMs, metadata: { operation: 'post_completion', kind: job.kind, provider: job.provider, modelId: job.modelId, attempts: job.attempts, jobId: String(job._id), correlationId: job.correlationId || String(job._id) } }, error);
      return { id: String(job._id), status: currentState };
    }
    const lastError = error instanceof Error ? error.message.slice(0, 500) : 'Error desconocido del proveedor.';
    const errorCategory = generationJobErrorCategory({
      httpStatus: providerHttpStatus(error),
      code: safeErrorCode(error),
      message: lastError,
    });
    if (job.attempts < job.maxAttempts) {
      const delayMinutes = 2 ** Math.max(0, job.attempts - 1);
      job = await transitionGenerationJob({
        jobId: String(job._id),
        from: currentState,
        to: 'queued',
        lockToken,
        patch: {
          progressMessage: `Reintento ${job.attempts + 1} de ${job.maxAttempts}`,
          nextAttemptAt: new Date(Date.now() + delayMinutes * 60_000),
          lastError,
          errorCategory,
        },
      });
      currentState = 'queued';
      reportOperationalError({ category: 'ai_generation', name: 'generation_retry_scheduled', route: '/api/ai/jobs/process', userId: job.userId, productId: observedProductId, durationMs, costUsd: job.estimatedCostUsd, value: job.creditCost, unit: 'credits', metadata: { operation: 'generate', kind: job.kind, provider: job.provider, modelId: job.modelId, attempts: job.attempts, jobId: String(job._id), correlationId: job.correlationId || String(job._id) } }, error);
    } else {
      await refundCredits(job);
      job = await transitionGenerationJob({
        jobId: String(job._id),
        from: currentState,
        to: 'failed',
        lockToken,
        patch: {
          progressMessage: 'La generación falló y los créditos fueron devueltos',
          lastError,
          errorCategory,
          actualDurationMs: durationMs,
          actualCostUsd: null,
          creditsState: job.creditsState,
        },
      });
      currentState = 'failed';
      await notifyJobFinished(job);
      await job.save();
      reportOperationalError({ category: 'ai_generation', name: 'generation_failed', route: '/api/ai/jobs/process', userId: job.userId, productId: observedProductId, durationMs, costUsd: job.estimatedCostUsd, value: job.creditCost, unit: 'credits', metadata: { operation: 'generate', kind: job.kind, provider: job.provider, modelId: job.modelId, attempts: job.attempts, jobId: String(job._id), correlationId: job.correlationId || String(job._id) } }, error);
    }
    if (currentState === 'failed') await finalizeModelRegressionForJob(String(job._id)).catch(() => undefined);
  }
  return { id: String(job._id), status: currentState };
}

async function handle(request: Request) {
  const headers = cacheHeaders('private-no-store');
  const { userId } = await auth();
  const isCron = hasValidCronSecret(request);
  const queueRequest = request.method === 'POST'
    ? await verifyGenerationQueueRequest(request)
    : { verified: false, jobId: undefined };
  if (!isCron && !queueRequest.verified && !userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers });
  await connectToDatabase();
  const searchParams = new URL(request.url).searchParams;
  const requestedJobId = searchParams.get('jobId')?.trim() || undefined;
  const jobId = requestedJobId || (queueRequest.verified ? queueRequest.jobId : undefined);
  if (jobId && !mongoose.isValidObjectId(jobId)) {
    return NextResponse.json({ error: 'Identificador de trabajo inválido.' }, { status: 400, headers });
  }
  if (queueRequest.verified && (!jobId || (requestedJobId && queueRequest.jobId !== requestedJobId))) {
    return NextResponse.json({ error: 'El trabajo firmado no coincide con el destino.' }, { status: 400, headers });
  }
  const requested = Number(searchParams.get('limit') ?? (jobId ? 1 : 3));
  const limit = Math.min(5, Math.max(1, Number.isFinite(requested) ? Math.floor(requested) : 3));

  if (isCron || queueRequest.verified) {
    const processed = [];
    const workerLimit = queueRequest.verified ? 1 : limit;
    for (let index = 0; index < workerLimit; index += 1) {
      const result = await processOne(undefined, 5, queueRequest.verified ? jobId : undefined);
      if (!result) break;
      processed.push(result);
    }
    return NextResponse.json({ processed, count: processed.length }, { headers });
  }

  // En serverless no es seguro responder y continuar trabajando en una promesa suelta:
  // la instancia puede congelarse justo después de enviar la respuesta. Conservamos esta
  // petición abierta hasta que el proveedor termine y el cliente consulta el progreso en paralelo.
  const processed = [];
  for (let index = 0; index < limit; index += 1) {
    const result = await processOne(userId || undefined, 5, jobId);
    if (!result) break;
    processed.push(result);
    if (jobId) break;
  }
  return NextResponse.json({ processed, count: processed.length }, { headers });
}

export const GET = handle;
export const POST = handle;
