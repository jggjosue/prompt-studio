import { runAIJob } from '@/lib/ai-job-runner';
import { captureCredits, notifyJobFinished, refundCredits } from '@/lib/ai-job-service';
import { hasValidCronSecret } from '@/lib/api-auth';
import { recordAssetProvenance } from '@/lib/asset-provenance-server';
import { cacheHeaders } from '@/lib/cache-policy';
import { actualProviderCost, generationQuote, providerUsage } from '@/lib/generation-pricing';
import { finalizeModelRegressionForJob } from '@/lib/model-regression-server';
import connectToDatabase from '@/lib/mongoose';
import { observeOperation, recordObservabilityEvent, reportOperationalError } from '@/lib/observability-server';
import { validateAndRepairOutput } from '@/lib/output-contract';
import { recordProjectFunnelEvent } from '@/lib/project-funnel-events';
import AIGenerationJob from '@/models/AIGenerationJob';
import OutputContract from '@/models/OutputContract';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export const maxDuration = 300;

async function processOne(userId?: string, leaseMinutes = 5) {
  const now = new Date();
  const claimFilter: Record<string, unknown> = {
    status: { $in: ['queued', 'retrying', 'processing'] },
    nextAttemptAt: { $lte: now },
    $or: [{ leaseExpiresAt: null }, { leaseExpiresAt: { $lte: now } }],
    ...(userId ? { userId } : {}),
  };
  const job = await observeOperation({ category: 'slow_query', name: 'ai_job_claim', route: '/api/ai/jobs/process' }, () => AIGenerationJob.findOneAndUpdate(
    claimFilter,
    { $set: { status: 'processing', progress: 10, progressMessage: 'Procesando con el proveedor', leaseExpiresAt: new Date(now.getTime() + leaseMinutes * 60_000), startedAt: now, updatedAt: now }, $inc: { attempts: 1 } },
    { sort: { nextAttemptAt: 1, createdAt: 1 }, returnDocument: 'after' }
  ));
  if (!job) return null;
  const generationStarted = performance.now();
  const observedProductId = typeof job.input.productId === 'string' ? job.input.productId.slice(0, 120) : String(job._id);
  try {
    job.progress = 35;
    job.progressMessage = 'Generando contenido';
    await job.save();
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
    job.status = 'completed';
    job.progress = 100;
    job.progressMessage = 'Creación terminada';
    job.completedAt = new Date();
    job.leaseExpiresAt = null;
    job.updatedAt = new Date();
    await captureCredits(job);
    await notifyJobFinished(job);
    await job.save();
    await recordAssetProvenance(job).catch(() => undefined);
    if (job.projectId) await recordProjectFunnelEvent({ userId: job.userId, projectId: job.projectId, stage: 'first_generation', occurredAt: job.completedAt || new Date(), sourceId: String(job._id) }).catch(() => undefined);
    await finalizeModelRegressionForJob(String(job._id)).catch(() => undefined);
    void recordObservabilityEvent({ category: 'ai_generation', name: 'generation_completed', route: '/api/ai/jobs/process', userId: job.userId, productId: observedProductId, status: 'completed', durationMs: Math.round(performance.now() - generationStarted), costUsd: job.estimatedCostUsd, value: job.creditCost, unit: 'credits', metadata: { operation: 'generate', kind: job.kind, provider: job.provider, attempts: job.attempts, jobId: String(job._id), correlationId: String(job._id) } });
  } catch (error) {
    const durationMs = Math.round(performance.now() - generationStarted);
    job.lastError = error instanceof Error ? error.message.slice(0, 500) : 'Error desconocido del proveedor.';
    job.leaseExpiresAt = null;
    job.updatedAt = new Date();
    if (job.attempts < job.maxAttempts) {
      const delayMinutes = 2 ** Math.max(0, job.attempts - 1);
      job.status = 'retrying';
      job.progress = 0;
      job.progressMessage = `Reintento ${job.attempts + 1} de ${job.maxAttempts}`;
      job.nextAttemptAt = new Date(Date.now() + delayMinutes * 60_000);
      reportOperationalError({ category: 'ai_generation', name: 'generation_retry_scheduled', route: '/api/ai/jobs/process', userId: job.userId, productId: observedProductId, durationMs, costUsd: job.estimatedCostUsd, value: job.creditCost, unit: 'credits', metadata: { operation: 'generate', kind: job.kind, provider: job.provider, attempts: job.attempts, jobId: String(job._id), correlationId: String(job._id) } }, error);
    } else {
      job.status = 'failed';
      job.progress = 100;
      job.progressMessage = 'La generación falló y los créditos fueron devueltos';
      job.completedAt = new Date();
      job.actualDurationMs = durationMs;
      job.actualCostUsd = null;
      await refundCredits(job);
      await notifyJobFinished(job);
      reportOperationalError({ category: 'ai_generation', name: 'generation_failed', route: '/api/ai/jobs/process', userId: job.userId, productId: observedProductId, durationMs, costUsd: job.estimatedCostUsd, value: job.creditCost, unit: 'credits', metadata: { operation: 'generate', kind: job.kind, provider: job.provider, attempts: job.attempts, jobId: String(job._id), correlationId: String(job._id) } }, error);
    }
    await job.save();
    if (job.status === 'failed') await finalizeModelRegressionForJob(String(job._id)).catch(() => undefined);
  }
  return { id: String(job._id), status: job.status };
}

async function handle(request: Request) {
  const headers = cacheHeaders('private-no-store');
  const { userId } = await auth();
  const isCron = hasValidCronSecret(request);
  if (!isCron && !userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers });
  await connectToDatabase();
  const requested = Number(new URL(request.url).searchParams.get('limit') ?? 3);
  const limit = Math.min(5, Math.max(1, Number.isFinite(requested) ? Math.floor(requested) : 3));

  if (isCron) {
    const processed = [];
    for (let index = 0; index < limit; index += 1) {
      const result = await processOne();
      if (!result) break;
      processed.push(result);
    }
    return NextResponse.json({ processed, count: processed.length }, { headers });
  }

  // Disparado por el usuario: procesa solo sus trabajos en segundo plano (lease corto para que el cron
  // lo recupere rápido si la instancia se apaga) y retorna inmediato.
  void (async () => {
    try {
      await connectToDatabase();
      for (let index = 0; index < limit; index += 1) {
        const result = await processOne(userId || undefined, 0.5);
        if (!result) break;
      }
    } catch {
      // El cron recuperará los trabajos pendientes.
    }
  })();
  return NextResponse.json({ triggered: true }, { headers });
}

export const GET = handle;
export const POST = handle;
