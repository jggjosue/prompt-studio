import assert from 'node:assert/strict';
import test from 'node:test';
import { generationRetryDecision, isRetryableGenerationError } from '../../src/lib/generation-retry-policy';

test('only typed transient categories are retryable', () => {
  for (const category of ['timeout', 'rate_limit_or_quota', 'provider_unavailable'] as const) {
    assert.equal(isRetryableGenerationError(category), true, category);
  }
  for (const category of ['bad_request', 'auth_or_permission', 'model_not_found', 'provider_error', 'validation_error', 'configuration_error', 'storage_error', 'cancelled', 'unknown'] as const) {
    assert.equal(isRetryableGenerationError(category), false, category);
  }
});

test('permanent failures move immediately to dead-letter', () => {
  const decision = generationRetryDecision({ category: 'bad_request', attempt: 1, maxAttempts: 3 });
  assert.deepEqual(decision, { action: 'dead_letter', retryable: false, delayMs: null, nextAttemptAt: null });
});

test('transient failures use bounded exponential backoff with jitter', () => {
  const now = new Date('2026-09-28T12:00:00.000Z');
  const first = generationRetryDecision({ category: 'timeout', attempt: 1, maxAttempts: 4, now, random: () => 0.5 });
  const second = generationRetryDecision({ category: 'provider_unavailable', attempt: 2, maxAttempts: 4, now, random: () => 1 });
  assert.equal(first.action, 'retry');
  assert.equal(first.delayMs, 60_000);
  assert.equal(first.nextAttemptAt.toISOString(), '2026-09-28T12:01:00.000Z');
  assert.equal(second.action, 'retry');
  assert.equal(second.delayMs, 144_000);
});

test('transient failures stop at the configured maximum', () => {
  const decision = generationRetryDecision({ category: 'rate_limit_or_quota', attempt: 3, maxAttempts: 3 });
  assert.deepEqual(decision, { action: 'dead_letter', retryable: true, delayMs: null, nextAttemptAt: null });
});
