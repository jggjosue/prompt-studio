import assert from 'node:assert/strict';
import test from 'node:test';

import { rebuildBehaviorSegments, rebuildPreferenceTopics } from '../../src/lib/email-segmentation.ts';

test('behavior segments are rebuilt deterministically from product facts', () => {
  const now = new Date('2026-10-01T00:00:00Z');
  assert.deepEqual(rebuildBehaviorSegments({
    registeredAt: new Date('2026-09-01T00:00:00Z'),
    activatedAt: new Date('2026-09-02T00:00:00Z'),
    lastActiveAt: new Date('2026-09-01T00:00:00Z'),
    createdImage: true,
    customer: true,
  }, now), ['new_registered', 'activated', 'inactive_7d', 'inactive_30d', 'image_creator', 'customer']);
});

test('topics are user-controlled allowlisted preferences', () => {
  assert.deepEqual(
    rebuildPreferenceTopics(['offers', 'sensitive_health_guess', 'offers', 'tutorials']),
    ['offers', 'tutorials'],
  );
});

test('segments do not require demographic or sensitive inferred attributes', () => {
  const segments = rebuildBehaviorSegments({ createdVideo: true, premiumInterest: true });
  assert.deepEqual(segments, ['video_creator', 'premium_interest']);
});
