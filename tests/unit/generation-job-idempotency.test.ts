import assert from 'node:assert/strict';
import test from 'node:test';
import {
  claimExhaustedGenerationJobAtomically,
  claimGenerationJobAtomically,
  type AtomicGenerationJobStore,
} from '../../src/lib/generation-job-claim';
import { generationSubmissionKey } from '../../src/lib/generation-idempotency';

type FakeJob = {
  _id: string;
  userId: string;
  status: string;
  creditsState?: string;
  attempts: number;
  maxAttempts: number;
  nextAttemptAt: Date;
  leaseExpiresAt: Date | null;
  lockToken?: string;
  lockOwner?: string;
  lockAcquiredAt?: Date;
  startedAt?: Date;
  updatedAt?: Date;
  progress?: number;
  progressMessage?: string;
};

function atomicStore(records: FakeJob[]): AtomicGenerationJobStore<FakeJob> {
  return {
    async findOneAndUpdate(filter, update) {
      const states = (filter.status as { $in: string[] }).$in;
      const due = (filter.nextAttemptAt as { $lte: Date }).$lte;
      const leaseDue = ((filter.$or as Array<{ leaseExpiresAt: { $lte?: Date } | null }>)[1].leaseExpiresAt as { $lte: Date }).$lte;
      const expression = filter.$expr as { $lt?: string[]; $gte?: string[] };
      const attemptsMatch = expression.$lt
        ? (candidate: FakeJob) => candidate.attempts < candidate.maxAttempts
        : (candidate: FakeJob) => candidate.attempts >= candidate.maxAttempts;
      const record = records.find(candidate =>
        states.includes(candidate.status)
        && candidate.creditsState === filter.creditsState
        && candidate.nextAttemptAt <= due
        && attemptsMatch(candidate)
        && (candidate.leaseExpiresAt === null || candidate.leaseExpiresAt <= leaseDue)
        && (!filter.userId || candidate.userId === filter.userId)
        && (!filter._id || candidate._id === filter._id),
      );
      if (!record) return null;
      Object.assign(record, (update.$set as Record<string, unknown>));
      record.attempts += Number((update.$inc as { attempts?: number } | undefined)?.attempts ?? 0);
      return { ...record };
    },
  };
}

const queued = (overrides: Partial<FakeJob> = {}): FakeJob => ({
  _id: 'job-1',
  userId: 'user-1',
  status: 'queued',
  creditsState: 'reserved',
  attempts: 0,
  maxAttempts: 3,
  nextAttemptAt: new Date('2026-09-28T10:00:00.000Z'),
  leaseExpiresAt: null,
  ...overrides,
});

test('concurrent processors cannot both claim the same generation', async () => {
  const records = [queued()];
  const now = new Date('2026-09-28T10:01:00.000Z');
  const claims = await Promise.all(
    Array.from({ length: 24 }, (_, index) => claimGenerationJobAtomically(
      atomicStore(records),
      { owner: `worker-${index}`, leaseMs: 300_000 },
      now,
      `token-${index}`,
    )),
  );
  assert.equal(claims.filter(Boolean).length, 1);
  assert.equal(records[0].attempts, 1);
  assert.equal(records[0].status, 'processing');
});

test('an active lease is protected and an expired lease is recoverable', async () => {
  const now = new Date('2026-09-28T10:01:00.000Z');
  const records = [queued({
    status: 'processing',
    attempts: 1,
    leaseExpiresAt: new Date('2026-09-28T10:02:00.000Z'),
    lockToken: 'original-token',
  })];
  const store = atomicStore(records);
  assert.equal(await claimGenerationJobAtomically(store, { owner: 'worker-2', leaseMs: 300_000 }, now, 'token-2'), null);

  const recovered = await claimGenerationJobAtomically(
    store,
    { owner: 'worker-3', leaseMs: 300_000 },
    new Date('2026-09-28T10:03:00.000Z'),
    'token-3',
  );
  assert.equal(recovered?.lockToken, 'token-3');
  assert.equal(records[0].attempts, 2);
  assert.equal(records[0].lockOwner, 'worker-3');
});

test('jobs at their attempt limit cannot be reclaimed', async () => {
  const records = [queued({ status: 'processing', attempts: 3, maxAttempts: 3, leaseExpiresAt: new Date(0) })];
  const claim = await claimGenerationJobAtomically(
    atomicStore(records),
    { owner: 'worker', leaseMs: 300_000 },
    new Date('2026-09-28T10:03:00.000Z'),
    'new-token',
  );
  assert.equal(claim, null);
});

test('an expired job at its attempt limit is claimed only for terminal recovery', async () => {
  const records = [queued({ status: 'processing', attempts: 3, maxAttempts: 3, leaseExpiresAt: new Date(0) })];
  const recovered = await claimExhaustedGenerationJobAtomically(
    atomicStore(records),
    { owner: 'recovery-worker', leaseMs: 300_000 },
    new Date('2026-09-28T10:03:00.000Z'),
    'recovery-token',
  );
  assert.equal(recovered?.lockToken, 'recovery-token');
  assert.equal(records[0].attempts, 3, 'terminal recovery must not submit another provider attempt');
  assert.equal(records[0].progressMessage, 'Cerrando generación agotada');
});

test('provider submission key survives lease ownership changes', () => {
  const generation = { _id: 'job-1', generationIdempotencyKey: 'generation-stable-key' };
  assert.equal(generationSubmissionKey(generation), 'generation-stable-key');
  assert.equal(generationSubmissionKey({ ...generation }), 'generation-stable-key');
  assert.equal(generationSubmissionKey({ _id: 'legacy-job' }), 'legacy-job');
});
