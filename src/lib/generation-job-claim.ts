import { randomUUID } from 'node:crypto';
import { progressForGenerationJobState } from './generation-job-state';

export type GenerationJobClaimInput = {
  owner: string;
  leaseMs: number;
  userId?: string;
  jobId?: string;
  /**
   * Execution backend this claimer runs on (#835). Defaults to `legacy`.
   * A worker only ever claims jobs pinned to its own backend, so a job
   * dispatched to GCP can never also be executed by the Vercel cron.
   */
  executionBackend?: 'legacy' | 'gcp' | 'aws' | 'cloudflare';
};

/**
 * Jobs created before the selector existed have no `executionBackend`; they
 * belong to legacy. `{ $in: [..., null] }` also matches a missing field.
 */
export function executionBackendClaimFilter(backend: GenerationJobClaimInput['executionBackend'] = 'legacy') {
  return backend === 'legacy' ? { $in: ['legacy', null] } : backend;
}

export type AtomicGenerationJobStore<T> = {
  findOneAndUpdate(
    filter: Record<string, unknown>,
    update: Record<string, unknown>,
    options: Record<string, unknown>,
  ): Promise<T | null>;
};

/**
 * Claims a generation with one database compare-and-swap operation. The lease
 * makes abandoned work recoverable while the random token prevents an expired
 * worker from publishing over its replacement.
 */
export async function claimGenerationJobAtomically<T>(
  store: AtomicGenerationJobStore<T>,
  input: GenerationJobClaimInput,
  now = new Date(),
  lockToken: string = randomUUID(),
): Promise<{ job: T; lockToken: string } | null> {
  const job = await store.findOneAndUpdate(
    {
      status: { $in: ['queued', 'retrying', 'processing', 'uploading', 'finalizing'] },
      creditsState: 'reserved',
      nextAttemptAt: { $lte: now },
      $expr: { $lt: ['$attempts', '$maxAttempts'] },
      $or: [{ leaseExpiresAt: null }, { leaseExpiresAt: { $lte: now } }],
      executionBackend: executionBackendClaimFilter(input.executionBackend),
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

/** Claims an expired job that already exhausted its provider attempts.
 * The caller must terminalize/refund it without submitting to the provider.
 */
export async function claimExhaustedGenerationJobAtomically<T>(
  store: AtomicGenerationJobStore<T>,
  input: GenerationJobClaimInput,
  now = new Date(),
  lockToken: string = randomUUID(),
): Promise<{ job: T; lockToken: string } | null> {
  const job = await store.findOneAndUpdate(
    {
      status: { $in: ['queued', 'retrying', 'processing', 'uploading', 'finalizing'] },
      creditsState: 'reserved',
      nextAttemptAt: { $lte: now },
      $expr: { $gte: ['$attempts', '$maxAttempts'] },
      $or: [{ leaseExpiresAt: null }, { leaseExpiresAt: { $lte: now } }],
      executionBackend: executionBackendClaimFilter(input.executionBackend),
      ...(input.userId ? { userId: input.userId } : {}),
      ...(input.jobId ? { _id: input.jobId } : {}),
    },
    {
      $set: {
        status: 'processing',
        progressMessage: 'Cerrando generación agotada',
        lockOwner: input.owner,
        lockToken,
        lockAcquiredAt: now,
        leaseExpiresAt: new Date(now.getTime() + input.leaseMs),
        updatedAt: now,
      },
    },
    { sort: { nextAttemptAt: 1, createdAt: 1 }, returnDocument: 'after' },
  );
  return job ? { job, lockToken } : null;
}
