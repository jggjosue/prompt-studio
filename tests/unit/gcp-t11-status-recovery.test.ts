import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  recoveryDeliveryKey,
  rehomableJobsQuery,
  runCloudRecovery,
  undeliveredCloudJobsQuery,
  type CloudRecoveryDeps,
} from '../../src/lib/generation-cloud-recovery';
import { recommendedPollAfterMs } from '../../src/lib/generation-status-policy';

const NOW = new Date('2026-10-03T12:00:00Z');
const env = (value: Record<string, string>) => value as unknown as NodeJS.ProcessEnv;

test('adaptive polling: fast for images, slower and growing for video, null when terminal', () => {
  const image = recommendedPollAfterMs({ kind: 'image', status: 'processing', startedAt: NOW }, NOW)!;
  const videoEarly = recommendedPollAfterMs({ kind: 'video', status: 'processing', startedAt: NOW }, NOW)!;
  const videoLate = recommendedPollAfterMs({ kind: 'video', status: 'processing', startedAt: new Date(NOW.getTime() - 10 * 60_000) }, NOW)!;
  assert.equal(image, 1500);
  assert.ok(videoEarly >= 5000 && videoLate === 30_000 && videoLate > videoEarly);
  for (const status of ['completed', 'failed', 'dead_letter', 'cancelled'] as const) {
    assert.equal(recommendedPollAfterMs({ kind: 'video', status }, NOW), null);
  }
  const backoff = recommendedPollAfterMs({ kind: 'image', status: 'queued', createdAt: NOW, nextAttemptAt: new Date(NOW.getTime() + 90_000) }, NOW);
  assert.equal(backoff, 90_000, 'do not poll before the scheduled retry');
});

test('status API exposes backend, dispatch state, provider operation and the poll hint', () => {
  const serializer = readFileSync('src/lib/ai-job-serializer.ts', 'utf8');
  for (const field of ['executionBackend:', 'dispatch:', 'providerOperation:', 'pollAfterMs:']) assert.ok(serializer.includes(field), field);
  assert.doesNotMatch(serializer, /messageId|submissionKey|lockToken/, 'internal queue/lock identifiers stay private');
  const route = readFileSync('src/app/api/ai/jobs/[id]/route.ts', 'utf8');
  assert.match(route, /Retry-After/);
});

test('recovery queries only touch due, unleased, reserved cloud jobs', () => {
  const query = undeliveredCloudJobsQuery(NOW) as Record<string, any>;
  assert.deepEqual(query.executionBackend, { $in: ['gcp', 'aws', 'cloudflare'] });
  assert.deepEqual(query.status, { $in: ['queued', 'retrying'] });
  assert.equal(query.creditsState, 'reserved');
  assert.deepEqual(query.nextAttemptAt, { $lte: new Date(NOW.getTime() - 120_000) });
  const rehome = rehomableJobsQuery('gcp') as Record<string, any>;
  assert.equal(rehome.attempts, 0, 'only jobs that never started');
  assert.equal(rehome.providerOperation, null, 'never a job with a provider operation');
  assert.equal(recoveryDeliveryKey(NOW), recoveryDeliveryKey(new Date(NOW.getTime() + 60_000)), 'overlapping sweeps share a task name');
  assert.notEqual(recoveryDeliveryKey(NOW), recoveryDeliveryKey(new Date(NOW.getTime() + 11 * 60_000)));
});

type Job = { _id: string; kind: string; executionBackend: string; status: string; attempts: number; creditsState: string; creditCost: number; providerOperation: unknown };

function fakeDeps(jobs: Job[], envValue: Record<string, string> = {}) {
  const calls = { redispatch: [] as string[], legacy: [] as string[], release: [] as string[], reports: [] as string[] };
  // Minimal matcher for the fields the recovery filters rely on.
  const matches = (job: Job, filter: Record<string, any>) => {
    const backend = filter.executionBackend;
    if (typeof backend === 'string' ? job.executionBackend !== backend : backend?.$in && !backend.$in.includes(job.executionBackend)) return false;
    const status = filter.status;
    if (typeof status === 'string' ? job.status !== status : status?.$in && !status.$in.includes(job.status)) return false;
    if (filter.creditsState && job.creditsState !== filter.creditsState) return false;
    if (filter.attempts !== undefined && job.attempts !== filter.attempts) return false;
    if ('providerOperation' in filter && job.providerOperation !== null) return false;
    return true;
  };
  const claimed = new Set<string>();
  const deps: CloudRecoveryDeps<Job> = {
    claimOne: async (filter, update) => {
      const job = jobs.find(candidate => !claimed.has(candidate._id) && matches(candidate, filter));
      if (!job) return null;
      claimed.add(job._id);
      const set = (update.$set ?? {}) as { executionBackend?: string };
      if (set.executionBackend) job.executionBackend = set.executionBackend;
      return job;
    },
    find: async filter => jobs.filter(job => matches(job, filter)),
    redispatch: async (job, backend, key) => { calls.redispatch.push(`${job._id}:${backend}:${key}`); return { dispatched: true }; },
    legacyDispatch: async job => { calls.legacy.push(job._id); },
    release: async job => { calls.release.push(job._id); job.creditsState = 'refunded'; },
    report: event => { calls.reports.push(event.name); },
    env: env(envValue),
    now: () => NOW,
  };
  return { deps, calls };
}

const job = (overrides: Partial<Job>): Job => ({ _id: 'j', kind: 'image', executionBackend: 'gcp', status: 'queued', attempts: 1, creditsState: 'reserved', creditCost: 10, providerOperation: null, ...overrides });

test('lost deliveries are re-enqueued on their own backend, never on legacy', async () => {
  const { deps, calls } = fakeDeps([job({ _id: 'a' }), job({ _id: 'b', kind: 'video' }), job({ _id: 'legacy', executionBackend: 'legacy' })]);
  const summary = await runCloudRecovery(deps);
  assert.equal(summary.redispatched, 2);
  assert.ok(calls.redispatch.every(entry => entry.includes(':gcp:recovery-')));
  assert.deepEqual(calls.legacy, []);
});

test('kill switch re-homes only never-started jobs; started ones stay pinned and are not re-delivered', async () => {
  const jobs = [
    job({ _id: 'fresh', attempts: 0 }),
    job({ _id: 'retrying', attempts: 1 }),
    job({ _id: 'video-polling', kind: 'video', attempts: 0, providerOperation: { status: 'submitted' } }),
  ];
  const { deps, calls } = fakeDeps(jobs, { GCP_AI_KILL_SWITCH: 'true' });
  const summary = await runCloudRecovery(deps);
  assert.equal(summary.rehomed, 1);
  assert.deepEqual(calls.legacy, ['fresh']);
  assert.equal(jobs[0].executionBackend, 'legacy');
  assert.equal(jobs[1].executionBackend, 'gcp');
  assert.equal(jobs[2].executionBackend, 'gcp');
  assert.deepEqual(calls.redispatch, [], 'a killed backend receives nothing');
});

test('stranded reservations on terminal jobs are released once; completed+reserved is only reported', async () => {
  const jobs = [
    job({ _id: 'dl', status: 'dead_letter', executionBackend: 'legacy' }),
    job({ _id: 'failed', status: 'failed' }),
    job({ _id: 'already', status: 'failed', creditsState: 'refunded' }),
    job({ _id: 'done', status: 'completed' }),
  ];
  const { deps, calls } = fakeDeps(jobs);
  const first = await runCloudRecovery(deps);
  assert.deepEqual(calls.release.sort(), ['dl', 'failed']);
  assert.equal(first.completedReservedReported, 1);
  assert.ok(calls.reports.includes('generation_completed_with_reserved_credits'));
  const second = await runCloudRecovery(deps);
  assert.equal(second.creditsReleased, 0, 'no double refund on the next sweep');
});

test('all cloud flags off: recovery never dispatches anywhere for legacy jobs', async () => {
  const { deps, calls } = fakeDeps([job({ _id: 'l1', executionBackend: 'legacy' }), job({ _id: 'l2', executionBackend: 'legacy', attempts: 0 })]);
  const summary = await runCloudRecovery(deps);
  assert.deepEqual(summary, { redispatched: 0, redispatchFailed: 0, rehomed: 0, creditsReleased: 0, completedReservedReported: 0 });
  assert.deepEqual(calls, { redispatch: [], legacy: [], release: [], reports: [] });
});

test('legacy watchdog and processor are kept; recovery runs from the existing sweep', () => {
  const sweep = readFileSync('src/app/api/ai/jobs/sweep/route.ts', 'utf8');
  assert.match(sweep, /sweepStuckGenerationJobs/);
  assert.match(sweep, /runGenerationCloudRecovery\(\)/);
  assert.match(sweep, /requireCronOrAdmin/);
  readFileSync('src/app/api/ai/jobs/process/route.ts', 'utf8');
});
