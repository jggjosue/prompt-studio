import 'server-only';
import { claimExhaustedGenerationJobAtomically, claimGenerationJobAtomically } from '@/lib/generation-job-claim';
import {
  assertGenerationJobTransition,
  canonicalGenerationState,
  type GenerationJobState,
  isTerminalGenerationJobState,
  persistedStatesFor,
  progressForGenerationJobState,
} from '@/lib/generation-job-state';
import AIGenerationJob, { type IAIGenerationJob } from '@/models/AIGenerationJob';

export class GenerationJobOwnershipError extends Error {
  constructor() {
    super('GENERATION_JOB_TRANSITION_CONFLICT');
    this.name = 'GenerationJobOwnershipError';
  }
}

export async function claimGenerationJob(input: {
  owner: string;
  leaseMs: number;
  userId?: string;
  jobId?: string;
}): Promise<{ job: IAIGenerationJob; lockToken: string } | null> {
  return claimGenerationJobAtomically<IAIGenerationJob>(AIGenerationJob, input);
}

export async function claimExhaustedGenerationJob(input: {
  owner: string;
  leaseMs: number;
  userId?: string;
  jobId?: string;
}): Promise<{ job: IAIGenerationJob; lockToken: string } | null> {
  return claimExhaustedGenerationJobAtomically<IAIGenerationJob>(AIGenerationJob, input);
}

export async function updateOwnedGenerationJob(
  jobId: string,
  lockToken: string,
  patch: Record<string, unknown>,
): Promise<IAIGenerationJob> {
  const job = await AIGenerationJob.findOneAndUpdate(
    { _id: jobId, lockToken, status: { $in: ['processing', 'uploading', 'finalizing'] } },
    { $set: { ...patch, updatedAt: new Date() } },
    { returnDocument: 'after' },
  );
  if (!job) throw new GenerationJobOwnershipError();
  return job;
}

export async function transitionGenerationJob(input: {
  jobId: string;
  from: GenerationJobState;
  to: GenerationJobState;
  lockToken?: string;
  patch?: Record<string, unknown>;
}): Promise<IAIGenerationJob> {
  assertGenerationJobTransition(input.from, input.to);
  const now = new Date();
  const set: Record<string, unknown> = {
    ...(input.patch ?? {}),
    status: input.to,
    progress: progressForGenerationJobState(input.to),
    updatedAt: now,
  };
  if (input.to === 'uploading') set.uploadingAt = now;
  if (input.to === 'finalizing') set.finalizingAt = now;
  if (input.to === 'completed' || input.to === 'failed') set.completedAt = now;
  if (input.to === 'dead_letter') {
    set.deadLetterAt = now;
    set.completedAt = now;
  }
  if (input.to === 'cancelled') set.cancelledAt = now;

  const releaseOwnership = input.to === 'queued' || isTerminalGenerationJobState(input.to);
  const update: Record<string, unknown> = { $set: set };
  if (releaseOwnership) {
    update.$unset = { lockOwner: '', lockToken: '', lockAcquiredAt: '', leaseExpiresAt: '' };
  }
  const job = await AIGenerationJob.findOneAndUpdate(
    {
      _id: input.jobId,
      status: { $in: persistedStatesFor(input.from) },
      ...(input.lockToken ? { lockToken: input.lockToken } : {}),
    },
    update,
    { returnDocument: 'after' },
  );
  if (!job) throw new GenerationJobOwnershipError();
  return job;
}

export function currentGenerationJobState(job: Pick<IAIGenerationJob, 'status'>): GenerationJobState {
  return canonicalGenerationState(job.status);
}
