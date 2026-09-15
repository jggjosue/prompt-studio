import type { IAIGenerationJob } from '@/models/AIGenerationJob';

export function serializeAIJob(job: IAIGenerationJob) {
  return {
    id: String(job._id),
    kind: job.kind,
    provider: job.provider,
    promptVersionId: job.promptVersionId ?? null,
    promptVersionNumber: job.promptVersionNumber ?? null,
    projectId: job.projectId ?? null,
    outputContractId: job.outputContractId ?? null,
    outputValidation: job.outputValidation ?? null,
    status: job.status,
    progress: job.progress,
    progressMessage: job.progressMessage,
    result: job.status === 'completed' ? job.result ?? null : null,
    creditCost: job.creditCost,
    estimatedCostUsd: job.estimatedCostUsd,
    actualCostUsd: job.actualCostUsd ?? null,
    actualDurationMs: job.actualDurationMs ?? null,
    outputResolution: job.outputResolution ?? null,
    outputQuality: job.outputQuality ?? null,
    creditsState: job.creditsState,
    attempts: job.attempts,
    maxAttempts: job.maxAttempts,
    lastError: job.status === 'failed' ? job.lastError ?? null : null,
    /** Solo tiene sentido valorar un trabajo terminado. */
    feedbackUseful: job.feedbackUseful ?? null,
    createdAt: job.createdAt,
    completedAt: job.completedAt ?? null,
  };
}
