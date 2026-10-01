import assert from 'node:assert/strict';
import test from 'node:test';
import { ONBOARDING_SEQUENCE } from '../../src/lib/onboarding-lifecycle';

test('onboarding lifecycle delays are monotonic and start immediately', () => {
  assert.deepEqual(ONBOARDING_SEQUENCE.map(step => step.delayHours), [0, 24, 72, 120, 168]);
});

test('paid conversion steps stop after purchase', () => {
  assert.deepEqual(
    ONBOARDING_SEQUENCE.filter(step => step.stopAfterPurchase).map(step => step.step),
    [4, 5]
  );
});
