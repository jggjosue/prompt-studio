import test from 'node:test';
import assert from 'node:assert/strict';

const { isWebsiteGenerationTier, resolveWebsiteGenerationOperation } =
  await import('../../src/lib/website-generation-operation');

test('maps website tiers to authoritative Prompt Credit operations', () => {
  const simple = resolveWebsiteGenerationOperation({ websiteTier: 'simple' });
  const advanced = resolveWebsiteGenerationOperation({ websiteTier: 'advanced' });
  const complex = resolveWebsiteGenerationOperation({ websiteTier: 'complex' });

  assert.equal(simple.code, 'WEBSITE_SIMPLE');
  assert.equal(simple.creditCost, 20);
  assert.equal(advanced.code, 'WEBSITE_ADVANCED');
  assert.equal(advanced.creditCost, 50);
  assert.equal(complex.code, 'WEBSITE_COMPLEX');
  assert.equal(complex.creditCost, 100);
});

test('rejects missing or unsupported website tiers', () => {
  assert.equal(isWebsiteGenerationTier('advanced'), true);
  assert.equal(isWebsiteGenerationTier('enterprise'), false);
  assert.throws(() => resolveWebsiteGenerationOperation({}), /WEBSITE_TIER_REQUIRED/);
  assert.throws(() => resolveWebsiteGenerationOperation({ websiteTier: 'enterprise' }), /WEBSITE_TIER_REQUIRED/);
});
