import test from 'node:test';
import assert from 'node:assert/strict';

const { isImageGenerationTier, resolveImageGenerationOperation } =
  await import('../../src/lib/image-generation-operation');

test('maps image tiers to authoritative Prompt Credit operations', () => {
  const cases = [
    ['lite-1k', 'IMAGE_LITE_1K', 15, '1K'],
    ['quality-1k', 'IMAGE_QUALITY_1K', 30, '1K'],
    ['quality-2k', 'IMAGE_QUALITY_2K', 45, '2K'],
    ['quality-4k', 'IMAGE_QUALITY_4K', 70, '4K'],
  ] as const;

  for (const [tier, code, credits, resolution] of cases) {
    const operation = resolveImageGenerationOperation({ imageTier: tier });
    assert.equal(operation.code, code);
    assert.equal(operation.creditCost, credits);
    assert.equal(operation.resolution, resolution);
  }
});

test('rejects missing or unsupported image tiers', () => {
  assert.equal(isImageGenerationTier('quality-2k'), true);
  assert.equal(isImageGenerationTier('quality-8k'), false);
  assert.throws(() => resolveImageGenerationOperation({}), /IMAGE_TIER_REQUIRED/);
  assert.throws(() => resolveImageGenerationOperation({ imageTier: 'quality-8k' }), /IMAGE_TIER_REQUIRED/);
});
