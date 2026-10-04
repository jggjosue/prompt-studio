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
import { videoOperationAdapterFor } from '@/lib/video-operation-adapters';
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

async function prepareOutput(job: IAIGenerationJob) {
  await validateOutput(job);
  // Binaries go to R2; the job keeps references only.
  const externalized = await externalizeGenerationAssets({ jobId: String(job._id), userId: job.userId, result: job.result });
  job.result = externalized.result ?? job.result;
  if (externalized.code) void recordObservabilityEvent({ category: 'ai_generation', name: 'generation_asset_externalize_failed', route: 'generation-worker', userId: job.userId, status: 'degraded', metadata: { kind: job.kind, code: externalized.code, jobId: String(job._id) } });
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
  if (!result.dispatched) throw new Error(`GCP_FOLLOW_UP_${(result.reason ?? 'publish_failed').toUpperCase()}`);
}

const seconds = (value: string | undefined, fallback: number, min: number, max: number) => {
  const parsed = Number(value);
  return (Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback) * 1000;
};

const deps: GenerationWorkerDeps = {
  claim: claimGenerationJob,
  claimExhausted: claimExhaustedGenerationJob,
  transition: transitionGenerationJob,
  updateOwned: updateOwnedGenerationJob,
  isOwnershipError: error => error instanceof GenerationJobOwnershipError,
  runProvider: runAIJob,
  validateOutput: prepareOutput,
  capture: captureGenerationCredits,
  release: releaseGenerationCredits,
  notifyFinished: async job => {
    await notifyJobFinished(job);
    if (job.status === 'failed' || job.status === 'dead_letter') captureGenerationLifecycleBestEffort(job, 'generation_failed');
  },
  onStarted: job => captureGenerationLifecycleBestEffort(job, 'generation_started'),
  persist: async job => { await job.save(); },
  afterCompleted: async job => {
    await recordAssetProvenance(job).catch(() => undefined);
    captureGenerationLifecycleBestEffort(job, 'generation_completed');
    if (job.projectId) await recordProjectFunnelEvent({ userId: job.userId, projectId: job.projectId, stage: 'first_generation', occurredAt: job.completedAt || new Date(), sourceId: String(job._id) }).catch(() => undefined);
  },
  finalizeRegression: finalizeModelRegressionForJob,
  scheduleFollowUp: (job, input) => scheduleGcpFollowUp(job, input),
  // Video (#833): bounded polling per delivery; never one open request for the
  // whole render. Read at call time so ops can tune without redeploying code.
  longRunning: {
    adapterFor: job => videoOperationAdapterFor(job),
    get pollIntervalMs() { return seconds(process.env.AI_VIDEO_POLL_INTERVAL_SECONDS, 20, 5, 120); },
    get pollBudgetMs() { return seconds(process.env.AI_VIDEO_POLL_BUDGET_SECONDS, 60, 0, 600); },
    get maxOperationMs() { return seconds(process.env.AI_VIDEO_MAX_OPERATION_SECONDS, 20 * 60, 60, 2 * 60 * 60); },
    sleep: ms => new Promise(resolve => setTimeout(resolve, ms)),
  },
  observeClaim: (route, run) => observeOperation({ category: 'slow_query', name: 'ai_job_claim', route }, run),
  recordEvent: event => { void recordObservabilityEvent(event); },
  reportError: (event, error) => reportOperationalError(event, error),
  defaultOwner: defaultWorkerOwner,
};

/**
 * Shared generation runtime used by the Vercel process route, the Cloud Run
 * worker and the AWS worker. Provider execution, credit reconciliation and
 * retry policy (generationRetryDecision) live in generation-worker-core; this
 * module only wires the production dependencies (runAIJob,
 * captureGenerationCredits, releaseGenerationCredits, claimGenerationJob...).
 */
export const processGenerationJob = createGenerationJobProcessor(deps);
