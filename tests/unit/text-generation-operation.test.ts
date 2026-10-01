import test from 'node:test';
import assert from 'node:assert/strict';

const {
  isTextGenerationTier,
  resolveTextGenerationOperation,
} = await import('../../src/lib/text-generation-operation');

test('maps text tiers to authoritative Prompt Credit operations', () => {
  assert.equal(resolveTextGenerationOperation({ textTier: 'short' }).code, 'TEXT_SHORT');
  assert.equal(resolveTextGenerationOperation({ textTier: 'short' }).creditCost, 2);
  assert.equal(resolveTextGenerationOperation({ textTier: 'long' }).code, 'TEXT_LONG');
  assert.equal(resolveTextGenerationOperation({ textTier: 'long' }).creditCost, 5);
  assert.equal(resolveTextGenerationOperation({ textTier: 'complex' }).code, 'TEXT_COMPLEX');
  assert.equal(resolveTextGenerationOperation({ textTier: 'complex' }).creditCost, 10);
});

test('requires an explicit server-recognized text tier', () => {
  assert.equal(isTextGenerationTier('short'), true);
  assert.equal(isTextGenerationTier('premium'), false);
  assert.throws(() => resolveTextGenerationOperation({}), /TEXT_TIER_REQUIRED/);
  assert.throws(() => resolveTextGenerationOperation({ textTier: 'premium' }), /TEXT_TIER_REQUIRED/);
});
