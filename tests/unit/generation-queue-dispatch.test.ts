import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { createHash, createHmac } from 'node:crypto';
import { boundedQueueNumber, generationQueueMode, queueConfiguration } from '../../src/lib/generation-queue-policy';
import { verifyQStashJwt } from '../../src/lib/generation-queue-signature';

const source = (file: string) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');
const env = (value: Record<string, string>) => value as unknown as NodeJS.ProcessEnv;

test('immediate dispatch is opt-in and the kill switch always wins', () => {
  assert.equal(generationQueueMode({} as NodeJS.ProcessEnv), 'cron-recovery');
  assert.equal(generationQueueMode(env({ AI_QUEUE_DISPATCH_ENABLED: 'true' })), 'qstash');
  assert.equal(generationQueueMode(env({ AI_QUEUE_DISPATCH_ENABLED: 'true', AI_QUEUE_KILL_SWITCH: 'true' })), 'cron-recovery');
});

test('queue readiness requires token and both rotation keys', () => {
  const incomplete = queueConfiguration(env({ AI_QUEUE_DISPATCH_ENABLED: 'true', QSTASH_TOKEN: 'token' }));
  assert.equal(incomplete.ready, false);
  assert.deepEqual(incomplete.missing, ['QSTASH_CURRENT_SIGNING_KEY', 'QSTASH_NEXT_SIGNING_KEY']);

  const ready = queueConfiguration(env({
    AI_QUEUE_DISPATCH_ENABLED: 'true',
    QSTASH_TOKEN: 'token',
    QSTASH_CURRENT_SIGNING_KEY: 'current',
    QSTASH_NEXT_SIGNING_KEY: 'next',
  }));
  assert.equal(ready.ready, true);
});

test('flow control values are bounded to safe operational ranges', () => {
  assert.equal(boundedQueueNumber(undefined, 3, 100), 3);
  assert.equal(boundedQueueNumber('0', 3, 100), 1);
  assert.equal(boundedQueueNumber('200', 3, 100), 100);
  assert.equal(boundedQueueNumber('4.9', 3, 100), 4);
});

test('QStash verification binds signature, exact URL, body hash, and expiration', () => {
  const key = 'signing-key';
  const url = 'https://example.com/api/ai/jobs/process';
  const body = JSON.stringify({ jobId: '507f1f77bcf86cd799439011' });
  const now = 1_800_000_000_000;
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    aud: url,
    body: createHash('sha256').update(body).digest('base64url'),
    exp: Math.floor(now / 1000) + 60,
    nbf: Math.floor(now / 1000) - 1,
  })).toString('base64url');
  const signature = createHmac('sha256', key).update(`${header}.${payload}`).digest('base64url');
  const token = `${header}.${payload}.${signature}`;

  assert.equal(verifyQStashJwt(token, body, url, key, now), true);
  assert.equal(verifyQStashJwt(token, `${body} `, url, key, now), false);
  assert.equal(verifyQStashJwt(token, body, `${url}?tampered=1`, key, now), false);
  assert.equal(verifyQStashJwt(token, body, url, 'wrong-key', now), false);
  assert.equal(verifyQStashJwt(token, body, url, key, now + 120_000), false);
});

test('creation dispatches only after durable creation and credit reservation', async () => {
  const route = await source('src/app/api/ai/jobs/route.ts');
  const createAt = route.indexOf('AIGenerationJob.create');
  const reserveAt = route.indexOf('reserveGenerationCredits(job)', createAt);
  // #835: the route enqueues through the single-backend dispatcher, which
  // delegates to dispatchGenerationJob (QStash/cron) only for legacy jobs.
  const dispatchAt = route.indexOf('dispatchGenerationExecution(job', reserveAt);
  assert.ok(createAt >= 0 && reserveAt > createAt && dispatchAt > reserveAt);
});

test('processor verifies signed queue delivery and preserves cron recovery', async () => {
  const processRoute = await source('src/app/api/ai/jobs/process/route.ts');
  const dispatcher = await source('src/lib/generation-queue-dispatch.ts');
  const vercel = JSON.parse(await source('vercel.json')) as { crons?: Array<{ path: string }> };

  assert.ok(processRoute.includes('verifyGenerationQueueRequest(request)'));
  assert.ok(processRoute.includes('queueRequest.jobId !== requestedJobId'));
  assert.ok(dispatcher.includes('verifyQStashJwt(signature, body, request.url, key)'));
  assert.ok(dispatcher.includes("'Upstash-Content-Based-Deduplication': 'true'"));
  assert.ok(vercel.crons?.some(cron => cron.path === '/api/ai/jobs/process'));
});

test('ADR records provider choice, costs, limits, and reversible rollout', async () => {
  const adr = await source('docs/architecture/adr-004-immediate-generation-dispatch.md');
  for (const required of ['Upstash QStash', 'Vercel Queues', 'Cloudflare Queues', '$1 per 100,000', 'AI_QUEUE_KILL_SWITCH', 'cron']) {
    assert.ok(adr.includes(required), `ADR missing ${required}`);
  }
});
