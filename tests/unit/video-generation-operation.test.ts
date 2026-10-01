import test from 'node:test';
import assert from 'node:assert/strict';

const { isVideoGenerationTier, resolveVideoGenerationOperation } =
  await import('../../src/lib/video-generation-operation');

test('maps 8-second video presets to authoritative Prompt Credit operations', () => {
  const cases = [
    ['lite-720-8s', 'VIDEO_LITE_720_8S', 180, '720p'],
    ['lite-1080-8s', 'VIDEO_LITE_1080_8S', 285, '1080p'],
    ['fast-720-8s', 'VIDEO_FAST_720_8S', 360, '720p'],
    ['fast-1080-8s', 'VIDEO_FAST_1080_8S', 430, '1080p'],
    ['premium-8s', 'VIDEO_PREMIUM_8S', 1425, undefined],
  ] as const;

  for (const [tier, code, credits, resolution] of cases) {
    const operation = resolveVideoGenerationOperation({ videoTier: tier });
    assert.equal(operation.code, code);
    assert.equal(operation.creditCost, credits);
    assert.equal(operation.durationSeconds, 8);
    assert.equal(operation.resolution, resolution);
  }
});

test('rejects missing or unsupported video presets', () => {
  assert.equal(isVideoGenerationTier('fast-1080-8s'), true);
  assert.equal(isVideoGenerationTier('fast-1080-16s'), false);
  assert.throws(() => resolveVideoGenerationOperation({}), /VIDEO_TIER_REQUIRED/);
  assert.throws(() => resolveVideoGenerationOperation({ videoTier: 'fast-1080-16s' }), /VIDEO_TIER_REQUIRED/);
});
