import { randomUUID } from 'node:crypto';
import {
  assertGenerationJobTransition,
  isTerminalGenerationJobState,
  persistedStatesFor,
  type GenerationJobState,
} from '../../src/lib/generation-job-state';
import {
  createGenerationJobProcessor,
  type GenerationWorkerDeps,
  type LongRunningOperationAdapter,
  type WorkerClaimInput,
} from '../../src/lib/generation-worker-core';
import type { IAIGenerationJob } from '../../src/models/AIGenerationJob';

/**
 * In-memory model of the production boundaries used by worker tests:
 *  - claim/claimExhausted/transition/updateOwned follow the MongoDB filters in
 *    generation-job-claim.ts and generation-job-state-server.ts;
 *  - capture/release follow the ledger semantics of ai-job-service.ts
 *    (one ledger row per job+operation, conditional reserved->refunded);
 *  - the sync provider replays a result for a submission key it already
 *    accepted, like a provider honouring our Idempotency-Key header.
 * No network, no database, no paid provider calls.
 */

export type HarnessJob = Record<string, unknown> & {
  _id: string; status: string; attempts: number; maxAttempts: number; creditsState: string; nextAttemptAt: Date;
  leaseExpiresAt: Date | null; lockToken: string | null; executionBackend: string | null; generationIdempotencyKey: string;
};
export type Outcome = 'ok' | 'crash' | Error;

export class OwnershipError extends Error {}

export function httpError(status: number, message = `provider http ${status}`) {
  return Object.assign(new Error(message), { status });
}
export function networkError() {
  return Object.assign(new TypeError('fetch failed'), { cause: { code: 'ECONNRESET' } });
}

export const T0 = Date.parse('2026-10-03T00:00:00Z');

export function workerHarness(options: {
  outcomes?: Outcome[];
  executionBackend?: 'legacy' | 'gcp';
  maxAttempts?: number;
  creditCost?: number;
  kind?: string;
  provider?: string;
  adapter?: (h: { advance(ms: number): void }) => LongRunningOperationAdapter;
  pollIntervalMs?: number;
  pollBudgetMs?: number;
  maxOperationMs?: number;
}) {
  let now = T0;
  const ledger: Array<{ jobId: string; op: 'capture' | 'refund' }> = [];
  const providerAccepted = new Map<string, Record<string, unknown>>();
  const providerExecutions: string[] = [];
  const providerCalls: string[] = [];
  const followUps: Array<{ deliveryKey: string; scheduleAt: Date; reason: string }> = [];
  const outcomes = [...(options.outcomes ?? [])];
  const job: HarnessJob = {
    _id: '65f0000000000000000000aa', userId: 'user-1', kind: options.kind ?? 'image', provider: options.provider ?? 'google', modelId: 'm', input: { prompt: 'synthetic' },
    status: 'queued', attempts: 0, maxAttempts: options.maxAttempts ?? 3, creditsState: 'reserved', creditCost: options.creditCost ?? 10,
    nextAttemptAt: new Date(now), leaseExpiresAt: null, lockToken: null, lockOwner: null, correlationId: 'corr-1', estimatedCostUsd: 0.01,
    executionBackend: options.executionBackend ?? 'gcp', generationIdempotencyKey: 'gen-key-1', result: null, providerRequestId: null, providerOperation: null,
  };
  const snapshot = () => structuredClone(job) as unknown as IAIGenerationJob;
  const active = ['queued', 'retrying', 'processing', 'uploading', 'finalizing'];
  const backendMatches = (input: WorkerClaimInput) => input.executionBackend === 'legacy' ? job.executionBackend === 'legacy' || job.executionBackend === null : job.executionBackend === input.executionBackend;
  const claimable = (input: WorkerClaimInput) => active.includes(job.status) && job.creditsState === 'reserved' && job.nextAttemptAt.getTime() <= now
    && (!job.leaseExpiresAt || job.leaseExpiresAt.getTime() <= now) && backendMatches(input) && (!input.jobId || input.jobId === job._id);
  const control = { advance: (ms: number) => { now += ms; } };

  const deps: GenerationWorkerDeps = {
    claim: async input => {
      if (!claimable(input) || job.attempts >= job.maxAttempts) return null;
      const lockToken = randomUUID();
      Object.assign(job, { status: 'processing', lockToken, leaseExpiresAt: new Date(now + input.leaseMs), attempts: job.attempts + 1 });
      return { job: snapshot(), lockToken };
    },
    claimExhausted: async input => {
      if (!claimable(input) || job.attempts < job.maxAttempts) return null;
      const lockToken = randomUUID();
      Object.assign(job, { status: 'processing', lockToken, leaseExpiresAt: new Date(now + input.leaseMs) });
      return { job: snapshot(), lockToken };
    },
    transition: async ({ from, to, lockToken, patch }) => {
      assertGenerationJobTransition(from, to);
      if (!persistedStatesFor(from).includes(job.status as GenerationJobState) || (lockToken && job.lockToken !== lockToken)) throw new OwnershipError();
      Object.assign(job, structuredClone(patch ?? {}), { status: to });
      if (to === 'queued' || isTerminalGenerationJobState(to)) Object.assign(job, { lockToken: null, leaseExpiresAt: null });
      return snapshot();
    },
    updateOwned: async (_id, lockToken, patch) => {
      if (job.lockToken !== lockToken || !['processing', 'uploading', 'finalizing'].includes(job.status)) throw new OwnershipError();
      Object.assign(job, structuredClone(patch));
      return snapshot();
    },
    isOwnershipError: error => error instanceof OwnershipError,
    runProvider: async current => {
      const key = String((current as unknown as HarnessJob).generationIdempotencyKey);
      providerCalls.push(key);
      const replay = providerAccepted.get(key);
      if (replay) return replay;
      const outcome = outcomes.shift() ?? 'ok';
      if (outcome instanceof Error) throw outcome;
      providerExecutions.push(key);
      const result = { imageUrl: 'r2://synthetic.png', providerRequestId: `req-${providerExecutions.length}` };
      providerAccepted.set(key, result);
      if (outcome === 'crash') return new Promise<never>(() => undefined);
      return result;
    },
    validateOutput: async () => undefined,
    capture: async current => {
      if (current.creditsState !== 'reserved') return;
      if (!ledger.some(row => row.jobId === job._id && row.op === 'capture')) ledger.push({ jobId: job._id, op: 'capture' });
      current.creditsState = 'captured';
      current.creditsCharged = Number(job.creditCost);
      job.creditsState = 'captured';
    },
    release: async current => {
      if (Number(current.creditCost) <= 0 || current.creditsState !== 'reserved') return;
      if (!ledger.some(row => row.jobId === job._id && row.op === 'refund')) {
        if (job.creditsState !== 'reserved') throw new Error('CREDIT_REFUND_CONFLICT');
        job.creditsState = 'refunded';
        ledger.push({ jobId: job._id, op: 'refund' });
      }
      current.creditsState = 'refunded';
    },
    notifyFinished: async () => undefined,
    persist: async () => undefined,
    afterCompleted: async () => undefined,
    finalizeRegression: async () => undefined,
    scheduleFollowUp: async (_job, input) => { followUps.push({ deliveryKey: input.deliveryKey, scheduleAt: input.scheduleAt, reason: input.reason }); },
    ...(options.adapter ? {
      longRunning: {
        adapterFor: () => options.adapter!(control),
        pollIntervalMs: options.pollIntervalMs ?? 20_000,
        pollBudgetMs: options.pollBudgetMs ?? 40_000,
        maxOperationMs: options.maxOperationMs ?? 20 * 60_000,
        sleep: async ms => { now += ms; },
      },
    } : {}),
    observeClaim: (_route, run) => run(),
    recordEvent: () => undefined,
    reportError: () => undefined,
    defaultOwner: () => 'test-worker',
    clock: { now: () => now, perf: () => now },
  };
  const process = createGenerationJobProcessor(deps);
  const backend = options.executionBackend ?? 'gcp';
  return {
    job, ledger, providerExecutions, providerCalls, followUps,
    deliver: () => process(undefined, 5, job._id, { executionBackend: backend }),
    advance: control.advance,
    now: () => now,
    untilNextAttempt: () => { now = Math.max(now, job.nextAttemptAt.getTime()); },
    count: (op: 'capture' | 'refund') => ledger.filter(row => row.op === op).length,
  };
}
