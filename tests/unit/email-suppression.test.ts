import assert from 'node:assert/strict';
import test from 'node:test';

import { canSendNonTransactional, resendUnsubscribedState, suppressionPatch } from '../../src/lib/email-suppression.ts';

test('unsubscribe suppresses lifecycle mail', () => {
  const patch = suppressionPatch('unsubscribe', new Date('2026-01-01T00:00:00Z'));
  assert.equal(canSendNonTransactional({ marketingOptIn: true, ...patch }, 'lifecycle'), false);
});

test('hard bounce suppresses future non-transactional mail', () => {
  const patch = suppressionPatch('hard_bounce');
  assert.equal(canSendNonTransactional({ marketingOptIn: true, ...patch }, 'lifecycle'), false);
});

test('complaint suppresses future non-transactional mail', () => {
  const patch = suppressionPatch('complaint');
  assert.equal(canSendNonTransactional({ marketingOptIn: true, ...patch }, 'lifecycle'), false);
});

test('manual do-not-contact blocks B2B outreach', () => {
  assert.equal(canSendNonTransactional({ emailDoNotContact: true }, 'outreach'), false);
});

test('re-import preserves provider unsubscribed state for suppressed contact', () => {
  assert.equal(resendUnsubscribedState({ marketingOptIn: true, emailSuppressionReason: 'complaint' }), true);
});

test('lifecycle requires explicit opt-in even without suppression', () => {
  assert.equal(canSendNonTransactional({}, 'lifecycle'), false);
  assert.equal(canSendNonTransactional({ marketingOptIn: true }, 'lifecycle'), true);
});
