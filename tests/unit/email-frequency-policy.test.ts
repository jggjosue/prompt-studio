import assert from 'node:assert/strict';
import test from 'node:test';
import { canSendLifecycleMessage, sortLifecycleMessages } from '../../src/lib/email-frequency-policy.ts';

const now = new Date('2026-10-01T00:00:00Z');
const base = { unsubscribed: false, suppressed: false, purchased: false, recentNonTransactionalSentAt: [] as Date[] };

test('enforces checkout > onboarding > reactivation > newsletter > sales priority', () => {
  assert.deepEqual(sortLifecycleMessages(['sales', 'newsletter', 'checkout', 'reactivation', 'onboarding']), ['checkout', 'onboarding', 'reactivation', 'newsletter', 'sales']);
});

test('blocks immediately for unsubscribe or suppression', () => {
  assert.equal(canSendLifecycleMessage('newsletter', { ...base, unsubscribed: true }, now).reason, 'suppressed');
  assert.equal(canSendLifecycleMessage('newsletter', { ...base, suppressed: true }, now).reason, 'suppressed');
});

test('purchase suppresses pre-purchase nudges', () => {
  for (const kind of ['checkout', 'onboarding', 'reactivation', 'sales'] as const) {
    assert.equal(canSendLifecycleMessage(kind, { ...base, purchased: true }, now).reason, 'purchase');
  }
  assert.equal(canSendLifecycleMessage('newsletter', { ...base, purchased: true }, now).allowed, true);
});

test('caps global non-transactional sends at three per seven days', () => {
  const sent = [1, 2, 3].map(days => new Date(now.getTime() - days * 86_400_000));
  assert.equal(canSendLifecycleMessage('newsletter', { ...base, recentNonTransactionalSentAt: sent }, now).reason, 'frequency_cap');
});

test('lower priority message yields to pending higher priority lifecycle', () => {
  assert.equal(canSendLifecycleMessage('newsletter', { ...base, pendingHigherPriorityKinds: ['checkout'] }, now).reason, 'higher_priority_pending');
});
