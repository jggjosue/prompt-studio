import assert from 'node:assert/strict';
import test from 'node:test';

import { EMAIL_PREFERENCE_TOPICS, isEligibleForMarketing } from '../../src/lib/email-preferences.ts';

test('account/profile without explicit opt-in is not marketing eligible', () => {
  assert.equal(isEligibleForMarketing({}), false);
  assert.equal(isEligibleForMarketing({ marketingOptIn: false }), false);
});

test('unsubscribe always wins over opt-in', () => {
  assert.equal(
    isEligibleForMarketing({ marketingOptIn: true, unsubscribeTimestamp: new Date() }),
    false
  );
});

test('explicit active opt-in is eligible', () => {
  assert.equal(isEligibleForMarketing({ marketingOptIn: true, unsubscribeTimestamp: null }), true);
});

test('topics are a small non-sensitive allowlist', () => {
  assert.deepEqual(EMAIL_PREFERENCE_TOPICS, ['product_updates', 'tutorials', 'offers']);
});
