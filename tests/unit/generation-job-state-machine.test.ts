import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import {
  assertGenerationJobTransition,
  canonicalGenerationState,
  canonicalGenerationType,
  canTransitionGenerationJob,
  generationJobErrorCategory,
  isTerminalGenerationJobState,
  persistedStatesFor,
  progressForGenerationJobState,
} from '../../src/lib/generation-job-state';

const source = (file: string) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');

test('canonical state machine supports image, video and legacy project/web records', () => {
  assert.equal(canonicalGenerationType('image'), 'image');
  assert.equal(canonicalGenerationType('video'), 'video');
  assert.equal(canonicalGenerationType('project'), 'web');
  assert.equal(canonicalGenerationState('retrying'), 'queued');
  assert.deepEqual(persistedStatesFor('queued'), ['queued', 'retrying']);
});

test('legal lifecycle reaches completion through finalizing and rejects shortcuts', () => {
  assert.equal(canTransitionGenerationJob('queued', 'processing'), true);
  assert.equal(canTransitionGenerationJob('processing', 'uploading'), true);
  assert.equal(canTransitionGenerationJob('processing', 'finalizing'), true);
  assert.equal(canTransitionGenerationJob('uploading', 'finalizing'), true);
  assert.equal(canTransitionGenerationJob('finalizing', 'completed'), true);
  assert.equal(canTransitionGenerationJob('processing', 'completed'), false);
  assert.throws(() => assertGenerationJobTransition('queued', 'completed'), /Illegal generation job transition/);
});

test('completed, failed and cancelled are terminal states', () => {
  for (const state of ['completed', 'failed', 'cancelled'] as const) {
    assert.equal(isTerminalGenerationJobState(state), true);
    assert.equal(canTransitionGenerationJob(state, 'queued'), false);
  }
});

test('states expose stable progress floors and provider error categories', () => {
  const successfulStates = ['queued', 'processing', 'uploading', 'finalizing', 'completed'] as const;
  assert.deepEqual(
    successfulStates.map(progressForGenerationJobState),
    [0, 10, 70, 90, 100],
  );
  assert.equal(generationJobErrorCategory({ httpStatus: 429, code: 'RESOURCE_EXHAUSTED' }), 'rate_limit_or_quota');
  assert.equal(generationJobErrorCategory({ code: 'R2_NOT_CONFIGURED' }), 'storage_error');
  assert.equal(generationJobErrorCategory({ message: 'request timeout' }), 'timeout');
});

test('durable transitions are atomic and ownership-scoped', async () => {
  const server = await source('src/lib/generation-job-state-server.ts');
  assert.ok(server.includes('findOneAndUpdate'));
  assert.ok(server.includes('lockToken'));
  assert.ok(server.includes('leaseExpiresAt'));
  assert.ok(server.includes('persistedStatesFor(input.from)'));
  assert.ok(server.includes('assertGenerationJobTransition(input.from, input.to)'));
  assert.ok(server.includes("$unset = { lockOwner: '', lockToken: '', lockAcquiredAt: '', leaseExpiresAt: '' }"));
});

test('Mongo schema and serializer expose the canonical contract without destructive migration', async () => {
  const model = await source('src/models/AIGenerationJob.ts');
  const serializer = await source('src/lib/ai-job-serializer.ts');
  for (const field of ['correlationId', 'providerRequestId', 'assetRef', 'outputRef', 'errorCategory', 'lockOwner', 'lockToken', 'uploadingAt', 'finalizingAt', 'cancelledAt']) {
    assert.ok(model.includes(`${field}:`), `missing durable field ${field}`);
  }
  assert.ok(model.includes("'retrying'"), 'legacy retrying records must remain readable');
  for (const field of ['type:', 'model:', 'attempt:', 'estimatedCredits:', 'actualCredits:', 'timestamps:']) {
    assert.ok(serializer.includes(field), `serializer missing ${field}`);
  }
  assert.ok(serializer.includes('canonicalGenerationState(job.status)'));
  assert.ok(serializer.includes('canonicalGenerationType(job.kind)'));
});

test('manual retry creates a new idempotent job because failed is terminal', async () => {
  const retry = await source('src/app/api/ai/jobs/[id]/retry/route.ts');
  assert.ok(retry.includes('AIGenerationJob.create'));
  assert.ok(retry.includes('retryOfJobId'));
  assert.ok(retry.includes('idempotencyKey = `retry:${id}`'));
  assert.ok(!/original\.status\s*=/.test(retry));
});

test('processor uses the transition service instead of direct status assignments', async () => {
  const processRoute = await source('src/app/api/ai/jobs/process/route.ts');
  const runner = await source('src/lib/ai-job-runner.ts');
  const progressRoute = await source('src/app/api/ai/jobs/[id]/progress/route.ts');
  assert.ok(processRoute.includes('claimGenerationJob'));
  assert.ok(processRoute.includes('transitionGenerationJob'));
  assert.ok(processRoute.includes("to: 'finalizing'"));
  assert.ok(processRoute.includes("to: 'completed'"));
  assert.ok(!/job\.status\s*=/.test(processRoute));
  assert.ok(runner.includes('ownershipToken: job.lockToken'));
  assert.ok(progressRoute.includes('lockToken: ownershipToken'));
});
