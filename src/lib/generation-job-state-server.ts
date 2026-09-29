import 'server-only';
import { randomUUID } from 'node:crypto';
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
  const now = new Date();
  const lockToken = randomUUID();
  const claimableStates = ['queued', 'retrying', 'processing', 'uploading', 'finalizing'];
  const job = await AIGenerationJob.findOneAndUpdate(
    {
      status: { $in: claimableStates },
      nextAttemptAt: { $lte: now },
      $or: [{ leaseExpiresAt: null }, { leaseExpiresAt: { $lte: now } }],
      ...(input.userId ? { userId: input.userId } : {}),
      ...(input.jobId ? { _id: input.jobId } : {}),
    },
    {
      $set: {
        status: 'processing',
        progress: progressForGenerationJobState('processing'),
        progressMessage: 'Procesando con el proveedor',
        lockOwner: input.owner,
        lockToken,
        lockAcquiredAt: now,
        leaseExpiresAt: new Date(now.getTime() + input.leaseMs),
        startedAt: now,
        updatedAt: now,
      },
      $inc: { attempts: 1 },
    },
    { sort: { nextAttemptAt: 1, createdAt: 1 }, returnDocument: 'after' },
  );
  return job ? { job, lockToken } : null;
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
