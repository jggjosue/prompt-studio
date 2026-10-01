import assert from 'node:assert/strict';
import test from 'node:test';

import { suppressionPatch } from '../../src/lib/email-suppression.ts';

test('provider unsubscribe creates durable local suppression', () => {
  const at = new Date('2026-01-01T00:00:00Z');
  const patch = suppressionPatch('unsubscribe', at);
  assert.equal(patch.marketingOptIn, false);
  assert.equal(patch.emailSuppressionReason, 'unsubscribe');
  assert.equal(patch.unsubscribeTimestamp, at);
});

test('hard bounce and complaint create durable suppression', () => {
  assert.equal(suppressionPatch('hard_bounce').emailSuppressionReason, 'hard_bounce');
  assert.equal(suppressionPatch('complaint').emailSuppressionReason, 'complaint');
});
