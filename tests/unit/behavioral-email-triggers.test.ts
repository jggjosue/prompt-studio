import assert from 'node:assert/strict';
import test from 'node:test';
import { behavioralTriggerKey, BEHAVIORAL_TRIGGER_OBJECTIVES, shouldProcessBehavioralTrigger } from '../../src/lib/behavioral-email-triggers.ts';

const candidate = { userId: 'u1', trigger: 'checkout_started_no_purchase' as const, sourceEventId: 'checkout_1', occurredAt: new Date() };

test('trigger idempotency key is stable for the source event', () => {
  assert.equal(behavioralTriggerKey(candidate), 'u1:checkout_started_no_purchase:checkout_1');
});

test('frequency caps prevent lifecycle overload', () => {
  assert.equal(shouldProcessBehavioralTrigger({ candidate, alreadyProcessed: false, sentLifecycleInLast24h: 1, sentLifecycleInLast7d: 1 }).reason, 'frequency_cap');
  assert.equal(shouldProcessBehavioralTrigger({ candidate, alreadyProcessed: false, sentLifecycleInLast24h: 0, sentLifecycleInLast7d: 3 }).reason, 'frequency_cap');
});

test('purchase cancels irrelevant sales nudges', () => {
  assert.equal(shouldProcessBehavioralTrigger({ candidate: { ...candidate, purchased: true }, alreadyProcessed: false, sentLifecycleInLast24h: 0, sentLifecycleInLast7d: 0 }).reason, 'purchase_cancelled_sales_nudge');
});

test('every trigger has a measurable objective', () => {
  assert.equal(Object.values(BEHAVIORAL_TRIGGER_OBJECTIVES).every(Boolean), true);
});
