import { hasValidCronSecret } from '@/lib/api-auth';
import { transitionGenerationJob, getGenerationJob } from '@/lib/generation-job-state-server';
import { captureGenerationCredits } from '@/lib/generation-credit-boundary';
import { notifyJobFinished } from '@/lib/ai-job-service';
import { recordAssetProvenance } from '@/lib/asset-provenance-server';
import { captureGenerationLifecycleBestEffort } from '@/lib/training/capture';
import { externalizeGenerationAssets } from '@/lib/generation-assets';
import { finalizeModelRegressionForJob } from '@/lib/model-regression-server';
import { recordProjectFunnelEvent } from '@/lib/project-funnel-events';
import { generationQuote, actualProviderCost } from '@/lib/generation-pricing';
import { recordObservabilityEvent } from '@/lib/observability-server';
import { cacheHeaders } from '@/lib/cache-policy';
import connectToDatabase from '@/lib/mongoose';
import { NextResponse } from 'next/server';

export const maxDuration = 30;

export async function POST(request: Request) {
  const headers = cacheHeaders('private-no-store');
  if (!hasValidCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers });
  }

  await connectToDatabase();

  const body = await request.json().catch(() => ({}));
  const { jobId, lockToken, error, errorCategory, durationMs, usage } = body;
  let { result } = body;

  if (!jobId || !lockToken) {
    return NextResponse.json({ error: 'Missing jobId or lockToken' }, { status: 400, headers });
  }

  let job = await getGenerationJob(jobId);
  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404, headers });
  
  if (error) {
    // Manejar fallo
    job = await transitionGenerationJob({
      jobId,
      from: 'processing',
      to: 'retrying',
      lockToken,
      patch: {
        lastError: error,
        errorCategory: errorCategory || 'unknown',
        progressMessage: 'Ocurrió un error en el worker, preparándose para reintentar...',
      }
    });
    
    void recordObservabilityEvent({
      category: 'ai_generation',
      name: 'generation_failed',
      route: '/api/ai/jobs/worker/resolve',
      userId: job.userId,
      status: 'failed',
      metadata: { error, errorCategory }
    });
    
    return NextResponse.json({ success: false, status: 'retrying' }, { headers });
  }

  // Éxito: finalizar y facturar
  try {
    // Binaries go to R2; the job keeps references only.
    const externalized = await externalizeGenerationAssets({ jobId: String(job._id), userId: job.userId, result });
    result = externalized.result ?? result;
    const resultMeta = result as Record<string, unknown>;
    const quote = generationQuote(job.kind, job.provider);
    
    const actualCostUsd = usage?.costUsd ?? actualProviderCost(result);
    const outputResolution = typeof resultMeta.resolution === 'string' ? resultMeta.resolution.slice(0, 80) : quote.resolution;
    const outputQuality = typeof resultMeta.quality === 'string' ? resultMeta.quality.slice(0, 80) : quote.quality;
    const providerRequestId = ['providerRequestId', 'requestId'].map(k => resultMeta[k]).find(v => typeof v === 'string');
    const assetRef = ['imageKey', 'assetKey', 'imageUrl', 'videoUrl'].map(k => resultMeta[k]).find(v => typeof v === 'string');
    const outputRef = ['outputUrl', 'projectUrl', 'downloadUrl', 'url'].map(k => resultMeta[k]).find(v => typeof v === 'string');

    // Pasar a finalizing
    job = await transitionGenerationJob({
      jobId,
      from: 'processing',
      to: 'finalizing',
      lockToken,
      patch: {
        result,
        actualInputTokens: usage?.inputTokens || 0,
        actualOutputTokens: usage?.outputTokens || 0,
        actualCostUsd,
        actualDurationMs: durationMs,
        outputResolution,
        outputQuality,
        providerRequestId: typeof providerRequestId === 'string' ? providerRequestId.slice(0, 200) : null,
        assetRef: typeof assetRef === 'string' ? assetRef.slice(0, 500) : null,
        outputRef: typeof outputRef === 'string' ? outputRef.slice(0, 500) : null,
        progressMessage: 'Finalizando la creación',
      },
    });

    // Cobrar créditos
    await captureGenerationCredits(job);

    // Completar
    job = await transitionGenerationJob({
      jobId,
      from: 'finalizing',
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

    await notifyJobFinished(job);
    await job.save();
    await recordAssetProvenance(job).catch(() => undefined);
    captureGenerationLifecycleBestEffort(job, 'generation_completed');
    
    if (job.projectId) {
      await recordProjectFunnelEvent({ 
        userId: job.userId, 
        projectId: job.projectId, 
        stage: 'first_generation', 
        occurredAt: job.completedAt || new Date(), 
        sourceId: String(job._id) 
      }).catch(() => undefined);
    }
    
    await finalizeModelRegressionForJob(String(job._id)).catch(() => undefined);
    
    void recordObservabilityEvent({ 
      category: 'ai_generation', 
      name: 'generation_completed', 
      route: '/api/ai/jobs/worker/resolve', 
      userId: job.userId, 
      status: 'completed', 
      durationMs: durationMs, 
      costUsd: job.estimatedCostUsd, 
      value: job.creditCost, 
      unit: 'credits' 
    });

    return NextResponse.json({ success: true, status: 'completed' }, { headers });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers });
  }
}
