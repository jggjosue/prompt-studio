import assert from 'node:assert/strict';
import test from 'node:test';

import { desiredResendSegmentation, RESEND_TOPIC_DEFINITIONS } from '../../src/lib/resend-segmentation.ts';

test('all marketing topics default to opt-out at the provider', () => {
  assert.equal(RESEND_TOPIC_DEFINITIONS.every(topic => topic.defaultSubscription === 'opt_out'), true);
});

test('desired provider state comes only from source facts and explicit topics', () => {
  const state = desiredResendSegmentation(
    { createdWeb: true, customer: true },
    ['product_updates', 'unknown'],
  );
  assert.deepEqual(state.segments, ['web_creator', 'customer']);
  assert.deepEqual(state.topics, ['product_updates']);
});
