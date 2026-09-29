import {
  canonicalGenerationState,
  canonicalGenerationType,
} from '@/lib/generation-job-state';
import type { IAIGenerationJob } from '@/models/AIGenerationJob';

function resultReference(result: Record<string, unknown> | null | undefined, keys: string[]): string | null {
  if (!result) return null;
  for (const key of keys) {
    const value = result[key];
    if (typeof value === 'string' && value.trim()) return value.trim().slice(0, 500);
  }
  return null;
}

export function serializeAIJob(job: IAIGenerationJob) {
  const id = String(job._id);
  const status = canonicalGenerationState(job.status);
  const assetRef = job.assetRef ?? resultReference(job.result, ['imageKey', 'assetKey', 'imageUrl', 'videoUrl']);
  const outputRef = job.outputRef ?? resultReference(job.result, ['outputUrl', 'projectUrl', 'downloadUrl', 'url']);
  return {
    id,
    userId: job.userId,
    type: canonicalGenerationType(job.kind),
    kind: job.kind,
    provider: job.provider,
    model: job.modelId ?? null,
    correlationId: job.correlationId || id,
    providerRequestId: job.providerRequestId ?? null,
    promptVersionId: job.promptVersionId ?? null,
    promptVersionNumber: job.promptVersionNumber ?? null,
    projectId: job.projectId ?? null,
    outputContractId: job.outputContractId ?? null,
    outputValidation: job.outputValidation ?? null,
    status,
    legacyStatus: job.status === status ? null : job.status,
    progress: job.progress,
    progressMessage: job.progressMessage,
    result: job.status === 'completed' ? job.result ?? null : null,
    estimatedCredits: job.creditCost,
    actualCredits: job.creditsCharged ?? null,
    assetRef,
    outputRef,
    errorCategory: job.errorCategory ?? null,
    retryable: job.retryable ?? null,
    failureMetadata: job.failureMetadata ?? null,
    creditCost: job.creditCost,
    estimatedCostUsd: job.estimatedCostUsd,
    actualCostUsd: job.actualCostUsd ?? null,
    actualDurationMs: job.actualDurationMs ?? null,
    outputResolution: job.outputResolution ?? null,
    outputQuality: job.outputQuality ?? null,
    creditsState: job.creditsState,
    attempt: job.attempts,
    attempts: job.attempts,
    maxAttempts: job.maxAttempts,
    lastError: job.status === 'failed' || job.status === 'dead_letter' ? job.lastError ?? null : null,
    /** Solo tiene sentido valorar un trabajo terminado. */
    feedbackUseful: job.feedbackUseful ?? null,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    startedAt: job.startedAt ?? null,
    uploadingAt: job.uploadingAt ?? null,
    finalizingAt: job.finalizingAt ?? null,
    completedAt: job.completedAt ?? null,
    deadLetterAt: job.deadLetterAt ?? null,
    reprocessedAt: job.reprocessedAt ?? null,
    reprocessedJobId: job.reprocessedJobId ?? null,
    cancelledAt: job.cancelledAt ?? null,
    timestamps: {
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      startedAt: job.startedAt ?? null,
      uploadingAt: job.uploadingAt ?? null,
      finalizingAt: job.finalizingAt ?? null,
      completedAt: job.completedAt ?? null,
      deadLetterAt: job.deadLetterAt ?? null,
      cancelledAt: job.cancelledAt ?? null,
    },
  };
}
