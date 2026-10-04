import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { dispatchPinnedGenerationJob, type DispatchRecord, type ExecutionDispatchDeps } from '../../src/lib/ai-execution-dispatch';
import { gcpAccessToken, resetGcpAccessTokenCache } from '../../src/lib/gcp-access-token';
import { dispatchGcpGenerationTask, gcpGenerationTaskPayload, gcpTaskId } from '../../src/lib/gcp-generation-dispatch';
import { claimGenerationJobAtomically, claimExhaustedGenerationJobAtomically, executionBackendClaimFilter } from '../../src/lib/generation-job-claim';

const env = (value: Record<string, string>) => value as unknown as NodeJS.ProcessEnv;
const GCP_ENV = env({
  GCP_AI_DISPATCH_ENABLED: 'true', GCP_AI_IMAGE_ENABLED: 'true', GCP_AI_VIDEO_ENABLED: 'true', GCP_AI_WEB_ENABLED: 'true',
  GCP_AI_PROJECT_ID: 'synthetic-project', GCP_AI_REGION: 'us-central1', GCP_AI_WORKER_URL: 'https://worker.invalid/',
  GCP_AI_QUEUE_INVOKER_SERVICE_ACCOUNT: 'ps-ai-queue-invoker@synthetic-project.iam.gserviceaccount.com',
});
const JOB_ID = '65f000000000000000000001';

function spies(overrides: Partial<ExecutionDispatchDeps> = {}) {
  const calls: string[] = [];
  const records: DispatchRecord[] = [];
  const deps: ExecutionDispatchDeps = {
    legacyDispatch: async () => { calls.push('legacy'); return { dispatched: true, mode: 'qstash', messageId: 'msg-1' }; },
    gcpAccessToken: async () => { calls.push('token'); return { ok: true, token: 'synthetic-token', source: 'metadata' }; },
    gcpDispatch: async () => { calls.push('gcp'); return { dispatched: true, backend: 'gcp-cloud-tasks', queue: 'ps-ai-image', taskName: 'projects/p/locations/r/queues/q/tasks/t' }; },
    recordDispatch: async (_id, record) => { records.push(record); },
    now: () => new Date('2026-10-03T00:00:00Z'),
    ...overrides,
  };
  return { deps, calls, records };
}

test('legacy-pinned jobs (and pre-selector jobs) use only the legacy transport', async () => {
  for (const executionBackend of ['legacy', null, undefined]) {
    const { deps, calls, records } = spies();
    const outcome = await dispatchPinnedGenerationJob({ id: JOB_ID, kind: 'image', correlationId: 'corr-1', executionBackend }, deps);
    assert.deepEqual(calls, ['legacy']);
    assert.equal(outcome.executionBackend, 'legacy');
    assert.equal(records.length, 1);
    assert.equal(records[0].backend, 'qstash');
    assert.equal(records[0].correlationId, 'corr-1');
  }
});

test('legacy without QStash records a cron-recovery skip, not a failure', async () => {
  const { deps, records } = spies({ legacyDispatch: async () => ({ dispatched: false, mode: 'cron-recovery', reason: 'disabled' }) });
  const outcome = await dispatchPinnedGenerationJob({ id: JOB_ID, kind: 'video', correlationId: 'c', executionBackend: 'legacy' }, deps);
  assert.equal(outcome.dispatched, false);
  assert.equal(records[0].state, 'skipped');
  assert.equal(records[0].backend, 'cron-recovery');
});

test('gcp-pinned jobs are enqueued once on Cloud Tasks and never on QStash', async () => {
  const { deps, calls, records } = spies();
  const outcome = await dispatchPinnedGenerationJob({ id: JOB_ID, kind: 'project', correlationId: 'corr-2', executionBackend: 'gcp' }, deps);
  assert.deepEqual(calls, ['token', 'gcp']);
  assert.equal(outcome.dispatched, true);
  assert.deepEqual({ ...records[0] }, {
    backend: 'gcp-cloud-tasks', queue: 'ps-ai-image', messageId: 'projects/p/locations/r/queues/q/tasks/t',
    dispatchedAt: new Date('2026-10-03T00:00:00Z'), correlationId: 'corr-2', workload: 'web', state: 'enqueued', reason: null,
  });
});

test('a failed GCP enqueue is never rescued by another backend', async () => {
  for (const override of [
    { gcpDispatch: async () => ({ dispatched: false, backend: 'gcp-cloud-tasks' as const, queue: 'ps-ai-image', reason: 'publish_failed' as const }) },
    { gcpAccessToken: async () => ({ ok: false as const, reason: 'exchange_failed' as const }) },
  ]) {
    const { deps, calls, records } = spies(override);
    const outcome = await dispatchPinnedGenerationJob({ id: JOB_ID, kind: 'image', correlationId: 'c', executionBackend: 'gcp' }, deps);
    assert.equal(calls.includes('legacy'), false, 'no dual dispatch to QStash');
    assert.equal(outcome.executionBackend, 'gcp', 'job stays pinned to its backend');
    assert.equal(records[0].state, 'failed');
  }
});

test('AWS/Cloudflare pins call no transport at all', async () => {
  for (const executionBackend of ['aws', 'cloudflare']) {
    const { deps, calls, records } = spies();
    const outcome = await dispatchPinnedGenerationJob({ id: JOB_ID, kind: 'image', correlationId: 'c', executionBackend }, deps);
    assert.deepEqual(calls, []);
    assert.equal(outcome.dispatched, false);
    assert.equal(records[0].reason, 'adapter_not_implemented');
  }
});

test('Cloud Tasks payload carries IDs only and the task is OIDC-authenticated', async () => {
  let sent: { url: string; body: Record<string, unknown> } | null = null;
  const fetchImpl = (async (url: string, init?: RequestInit) => {
    sent = { url, body: JSON.parse(String(init?.body)) };
    return new Response(JSON.stringify({ name: 'created-task' }), { status: 200 });
  }) as unknown as typeof fetch;
  const result = await dispatchGcpGenerationTask({ jobId: JOB_ID, correlationId: 'corr', workload: 'image' }, 'token', { env: GCP_ENV, fetchImpl });
  assert.equal(result.dispatched, true);
  const task = (sent!.body as { task: { name: string; httpRequest: { url: string; body: string; oidcToken: { serviceAccountEmail: string; audience: string } } } }).task;
  assert.equal(task.httpRequest.url, 'https://worker.invalid/tasks/generation');
  assert.equal(task.httpRequest.oidcToken.serviceAccountEmail, 'ps-ai-queue-invoker@synthetic-project.iam.gserviceaccount.com');
  assert.equal(task.httpRequest.oidcToken.audience, 'https://worker.invalid');
  const payload = JSON.parse(Buffer.from(task.httpRequest.body, 'base64').toString('utf8'));
  assert.deepEqual(payload, { version: 1, jobId: JOB_ID, correlationId: 'corr', workload: 'image' });
  assert.deepEqual(Object.keys(gcpGenerationTaskPayload({ jobId: 'j', correlationId: 'c', workload: 'video' })).sort(), ['correlationId', 'jobId', 'version', 'workload']);
});

test('same job dispatched twice maps to one deterministic task (409 = deduplicated)', async () => {
  assert.equal(gcpTaskId(JOB_ID), gcpTaskId(JOB_ID));
  assert.notEqual(gcpTaskId(JOB_ID), gcpTaskId(JOB_ID, 'retry-2'));
  const names: string[] = [];
  let status = 200;
  const fetchImpl = (async (_url: string, init?: RequestInit) => {
    names.push(JSON.parse(String(init?.body)).task.name);
    const response = new Response(JSON.stringify({ name: names.at(-1) }), { status });
    status = 409;
    return response;
  }) as unknown as typeof fetch;
  const first = await dispatchGcpGenerationTask({ jobId: JOB_ID, correlationId: 'c', workload: 'image' }, 't', { env: GCP_ENV, fetchImpl });
  const second = await dispatchGcpGenerationTask({ jobId: JOB_ID, correlationId: 'c', workload: 'image' }, 't', { env: GCP_ENV, fetchImpl });
  assert.equal(names[0], names[1]);
  assert.equal(first.dispatched && !first.deduplicated, true);
  assert.equal(second.dispatched && second.deduplicated, true);
});

test('GCP adapter refuses when disabled, killed or unconfigured, without calling the network', async () => {
  let called = false;
  const fetchImpl = (async () => { called = true; return new Response('{}'); }) as unknown as typeof fetch;
  const input = { jobId: JOB_ID, correlationId: 'c', workload: 'video' as const };
  assert.equal((await dispatchGcpGenerationTask(input, 't', { env: env({}), fetchImpl })).reason, 'disabled');
  assert.equal((await dispatchGcpGenerationTask(input, 't', { env: env({ ...GCP_ENV, GCP_AI_KILL_SWITCH: 'true' }), fetchImpl, force: true })).reason, 'disabled');
  assert.equal((await dispatchGcpGenerationTask(input, undefined, { env: GCP_ENV, fetchImpl })).reason, 'configuration_missing');
  assert.equal(called, false);
});

test('claims are scoped to the pinned execution backend', async () => {
  assert.deepEqual(executionBackendClaimFilter(), { $in: ['legacy', null] });
  assert.equal(executionBackendClaimFilter('gcp'), 'gcp');
  for (const claim of [claimGenerationJobAtomically, claimExhaustedGenerationJobAtomically]) {
    const filters: Record<string, unknown>[] = [];
    const store = { findOneAndUpdate: async (filter: Record<string, unknown>) => { filters.push(filter); return null; } };
    await claim(store, { owner: 'o', leaseMs: 1000 });
    await claim(store, { owner: 'o', leaseMs: 1000, jobId: JOB_ID, executionBackend: 'gcp' });
    assert.deepEqual(filters[0].executionBackend, { $in: ['legacy', null] }, 'legacy cron never claims a GCP job');
    assert.equal(filters[1].executionBackend, 'gcp');
  }
});

test('GCP access tokens come from metadata or workload identity, never JSON keys', async () => {
  resetGcpAccessTokenCache();
  const metadata = await gcpAccessToken({
    env: env({ K_SERVICE: 'prompt-studio-ai-worker' }),
    fetchImpl: async (url, init) => {
      assert.match(url, /metadata\.google\.internal/);
      assert.equal((init?.headers as Record<string, string>)['Metadata-Flavor'], 'Google');
      return new Response(JSON.stringify({ access_token: 'meta-token', expires_in: 3599 }));
    },
  });
  assert.deepEqual(metadata, { ok: true, token: 'meta-token', source: 'metadata' });

  resetGcpAccessTokenCache();
  assert.deepEqual(await gcpAccessToken({ env: env({}) }), { ok: false, reason: 'not_configured' });
  const wifEnv = env({ GCP_AI_WIF_PROVIDER: 'projects/1/locations/global/workloadIdentityPools/vercel/providers/vercel', GCP_AI_DISPATCHER_SERVICE_ACCOUNT: 'ps-ai-dispatcher@p.iam.gserviceaccount.com' });
  assert.deepEqual(await gcpAccessToken({ env: wifEnv }), { ok: false, reason: 'subject_token_missing' });

  const urls: string[] = [];
  const wif = await gcpAccessToken({
    env: wifEnv,
    subjectToken: 'vercel-oidc',
    now: () => Date.parse('2026-10-03T00:00:00Z'),
    fetchImpl: async url => {
      urls.push(url);
      if (url.includes('sts.googleapis.com')) return new Response(JSON.stringify({ access_token: 'federated' }));
      return new Response(JSON.stringify({ accessToken: 'impersonated', expireTime: '2026-10-03T00:10:00Z' }));
    },
  });
  assert.deepEqual(wif, { ok: true, token: 'impersonated', source: 'workload-identity-federation' });
  assert.match(urls[1], /ps-ai-dispatcher%40p\.iam\.gserviceaccount\.com:generateAccessToken$/);
  resetGcpAccessTokenCache();
  const failed = await gcpAccessToken({ env: wifEnv, subjectToken: 'x', fetchImpl: async () => new Response('nope', { status: 403 }) });
  assert.deepEqual(failed, { ok: false, reason: 'exchange_failed' });
  resetGcpAccessTokenCache();
});

test('route selects before persisting, reserves before enqueue, and the worker enforces its pin', () => {
  const route = readFileSync('src/app/api/ai/jobs/route.ts', 'utf8');
  const select = route.indexOf('selectExecutionBackend({ kind: raw.kind, routingKey: userId })');
  const create = route.indexOf('AIGenerationJob.create(');
  const reserve = route.indexOf('reserveGenerationCredits(job)');
  const enqueue = route.indexOf('dispatchGenerationExecution(job');
  assert.ok(select > 0 && select < create && create < reserve && reserve < enqueue);
  assert.doesNotMatch(route, /dispatchGenerationJob\(/, 'no direct QStash call that could double-dispatch');
  const worker = readFileSync('workers/generation/server.ts', 'utf8');
  assert.match(worker, /workerMayExecute\(\{workerBackend:'gcp'/);
  assert.match(worker, /executionBackend:'gcp'/);
  assert.match(worker, /workload_mismatch/);
});
