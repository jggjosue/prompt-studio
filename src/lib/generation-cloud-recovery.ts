import { CLOUD_EXECUTION_BACKENDS, cloudBackendFlags, type CloudExecutionBackend } from '@/lib/ai-execution-backend-policy';

/**
 * Recovery for jobs pinned to a cloud execution backend (#838).
 *
 * Runs from the existing watchdog (`/api/ai/jobs/sweep`) next to the stuck-job
 * sweeper; it never executes provider work itself.
 *
 *  1. Undelivered: a cloud job that is due (`queued`, `nextAttemptAt` passed by
 *     a grace period, no live lease) but whose delivery was lost — failed
 *     initial enqueue, failed follow-up enqueue, a stuck job the sweeper put
 *     back to `queued`, or a task dropped after max transport attempts (Cloud
 *     Tasks has no DLQ). It is re-enqueued on the SAME backend. The task name
 *     uses a 10-minute bucket so overlapping sweeps deduplicate, while later
 *     sweeps can still create a fresh task.
 *  2. Kill switch: when an operator kills a cloud backend, jobs that never
 *     started there (queued, 0 attempts, no provider operation) are moved
 *     back to legacy atomically. Started jobs are never moved: that is how a
 *     job could run twice.
 *  3. Credits: terminal jobs that still hold a reservation are released
 *     through the idempotent ledger boundary. Completed-but-reserved jobs are
 *     only reported (never auto-charged).
 */

export const RECOVERY_GRACE_MS = 2 * 60_000;
export const RECOVERY_BUCKET_MS = 10 * 60_000;
export const TERMINAL_RECONCILE_AFTER_MS = 5 * 60_000;

export type RecoverableJob = {
  _id: unknown;
  kind: string;
  correlationId?: string | null;
  executionBackend?: string | null;
  creditsState?: string;
  creditCost?: number;
  status?: string;
};

export function undeliveredCloudJobsQuery(now: Date, backends: readonly CloudExecutionBackend[] = CLOUD_EXECUTION_BACKENDS, graceMs = RECOVERY_GRACE_MS): Record<string, unknown> {
  const due = new Date(now.getTime() - graceMs);
  return {
    executionBackend: { $in: [...backends] },
    status: { $in: ['queued', 'retrying'] },
    creditsState: 'reserved',
    nextAttemptAt: { $lte: due },
    $and: [
      { $or: [{ leaseExpiresAt: null }, { leaseExpiresAt: { $lte: now } }] },
      // one recovery per job per grace window, even with concurrent sweeps
      { $or: [{ 'dispatch.lastRecoveryAt': null }, { 'dispatch.lastRecoveryAt': { $lte: due } }] },
    ],
  };
}

export function rehomableJobsQuery(backend: CloudExecutionBackend): Record<string, unknown> {
  return {
    executionBackend: backend,
    status: { $in: ['queued', 'retrying'] },
    attempts: 0,
    providerOperation: null,
    creditsState: 'reserved',
    $or: [{ leaseExpiresAt: null }, { leaseExpiresAt: { $exists: false } }],
  };
}

export function terminalReservedCreditsQuery(now: Date): Record<string, unknown> {
  return {
    status: { $in: ['failed', 'dead_letter', 'cancelled'] },
    creditsState: 'reserved',
    creditCost: { $gt: 0 },
    updatedAt: { $lte: new Date(now.getTime() - TERMINAL_RECONCILE_AFTER_MS) },
  };
}

export function completedReservedQuery(now: Date): Record<string, unknown> {
  return { status: 'completed', creditsState: 'reserved', creditCost: { $gt: 0 }, updatedAt: { $lte: new Date(now.getTime() - TERMINAL_RECONCILE_AFTER_MS) } };
}

export function recoveryDeliveryKey(now: Date) {
  return `recovery-${Math.floor(now.getTime() / RECOVERY_BUCKET_MS)}`;
}

export type CloudRecoveryDeps<J extends RecoverableJob> = {
  /** Atomically claims one job matching the filter and applies the update (findOneAndUpdate). */
  claimOne(filter: Record<string, unknown>, update: Record<string, unknown>): Promise<J | null>;
  find(filter: Record<string, unknown>, limit: number): Promise<J[]>;
  redispatch(job: J, backend: CloudExecutionBackend, deliveryKey: string): Promise<{ dispatched: boolean; reason?: string | null }>;
  legacyDispatch(job: J): Promise<void>;
  release(job: J): Promise<void>;
  report(event: { name: string; jobId: string; backend?: string | null; reason?: string | null }): void;
  env?: NodeJS.ProcessEnv;
  now?: () => Date;
};

export type CloudRecoverySummary = {
  redispatched: number;
  redispatchFailed: number;
  rehomed: number;
  creditsReleased: number;
  completedReservedReported: number;
};

export async function runCloudRecovery<J extends RecoverableJob>(deps: CloudRecoveryDeps<J>, limit = 25): Promise<CloudRecoverySummary> {
  const env = deps.env ?? process.env;
  const now = (deps.now ?? (() => new Date()))();
  const summary: CloudRecoverySummary = { redispatched: 0, redispatchFailed: 0, rehomed: 0, creditsReleased: 0, completedReservedReported: 0 };

  // 2 first: a killed backend must not receive re-deliveries.
  for (const backend of CLOUD_EXECUTION_BACKENDS) {
    if (!cloudBackendFlags(backend, env).killSwitch) continue;
    for (let i = 0; i < limit; i += 1) {
      const job = await deps.claimOne(rehomableJobsQuery(backend), {
        $set: { executionBackend: 'legacy', 'dispatch.reason': `rehomed_from_${backend}_kill_switch`, 'dispatch.lastRecoveryAt': now, updatedAt: now },
      });
      if (!job) break;
      summary.rehomed += 1;
      deps.report({ name: 'generation_rehomed_kill_switch', jobId: String(job._id), backend, reason: 'kill_switch' });
      await deps.legacyDispatch(job);
    }
  }

  // 1. Undelivered cloud jobs → same backend.
  // Started jobs on a killed backend are left for the operator, never moved.
  const live = CLOUD_EXECUTION_BACKENDS.filter(backend => !cloudBackendFlags(backend, env).killSwitch);
  const deliveryKey = recoveryDeliveryKey(now);
  for (let i = 0; i < limit && live.length; i += 1) {
    const job = await deps.claimOne(undeliveredCloudJobsQuery(now, live), { $set: { 'dispatch.lastRecoveryAt': now }, $inc: { 'dispatch.attempts': 1 } });
    if (!job) break;
    const backend = job.executionBackend as CloudExecutionBackend;
    const result = await deps.redispatch(job, backend, deliveryKey);
    if (result.dispatched) summary.redispatched += 1;
    else summary.redispatchFailed += 1;
    deps.report({ name: result.dispatched ? 'generation_redispatched' : 'generation_redispatch_failed', jobId: String(job._id), backend, reason: result.reason ?? null });
  }

  // 3. Credit reconciliation (idempotent ledger).
  for (const job of await deps.find(terminalReservedCreditsQuery(now), limit)) {
    await deps.release(job);
    summary.creditsReleased += 1;
    deps.report({ name: 'generation_credits_reconciled', jobId: String(job._id), reason: `terminal_${job.status}` });
  }
  for (const job of await deps.find(completedReservedQuery(now), limit)) {
    summary.completedReservedReported += 1;
    deps.report({ name: 'generation_completed_with_reserved_credits', jobId: String(job._id), reason: 'needs_operator_review' });
  }
  return summary;
}
