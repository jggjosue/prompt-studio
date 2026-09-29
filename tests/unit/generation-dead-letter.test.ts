import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { generationJobErrorCategory, isTerminalGenerationJobState } from '../../src/lib/generation-job-state';

const source = (file: string) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');

test('provider and configuration errors map to typed retry categories', () => {
  assert.equal(generationJobErrorCategory({ httpStatus: 400 }), 'bad_request');
  assert.equal(generationJobErrorCategory({ httpStatus: 401 }), 'auth_or_permission');
  assert.equal(generationJobErrorCategory({ httpStatus: 422 }), 'validation_error');
  assert.equal(generationJobErrorCategory({ code: 'CREDENTIAL_MISSING' }), 'configuration_error');
  assert.equal(generationJobErrorCategory({ httpStatus: 500 }), 'provider_unavailable');
  assert.equal(generationJobErrorCategory({ httpStatus: 503 }), 'provider_unavailable');
  assert.equal(isTerminalGenerationJobState('dead_letter'), true);
});

test('processor persists failure metadata and dead-letters exhausted or permanent jobs', async () => {
  const route = await source('src/app/api/ai/jobs/process/route.ts');
  assert.ok(route.includes('generationRetryDecision'));
  assert.ok(route.includes("to: 'dead_letter'"));
  for (const field of ['errorCategory', 'retryable', 'failureMetadata', 'httpStatus', 'errorCode']) {
    assert.ok(route.includes(field), `missing ${field}`);
  }
});

test('operator reprocess is admin-only, explicit and idempotent', async () => {
  const route = await source('src/app/api/admin/ai/jobs/[id]/reprocess/route.ts');
  assert.ok(route.includes('isPremiumJoAdmin'));
  assert.ok(route.includes('admin-dead-letter-reprocess:'));
  assert.ok(route.includes('rootCauseFixed !== true'));
  assert.ok(route.includes('operator-reprocess:${id}'));
  assert.ok(route.includes("status: 'dead_letter'"));
  assert.ok(route.includes('reprocessedJobId'));
  assert.ok(route.includes('reserveCredits(job)'));
});
