import test from 'node:test';
import assert from 'node:assert/strict';

const { isWebsiteAIEditTier, resolveWebsiteAIEditOperation } =
  await import('../../src/lib/website-ai-edit-operation');

test('maps AI website edit tiers to authoritative Prompt Credit operations', () => {
  const cases = [
    ['small', 'WEBSITE_AI_EDIT_SMALL', 5],
    ['section', 'WEBSITE_AI_EDIT_SECTION', 10],
    ['complex', 'WEBSITE_AI_EDIT_COMPLEX', 25],
    ['redesign', 'WEBSITE_AI_REDESIGN', 50],
  ] as const;

  for (const [tier, code, credits] of cases) {
    const operation = resolveWebsiteAIEditOperation({ websiteEditTier: tier });
    assert.equal(operation.code, code);
    assert.equal(operation.creditCost, credits);
  }
});

test('rejects missing or unsupported AI website edit tiers', () => {
  assert.equal(isWebsiteAIEditTier('section'), true);
  assert.equal(isWebsiteAIEditTier('full'), false);
  assert.throws(() => resolveWebsiteAIEditOperation({}), /WEBSITE_EDIT_TIER_REQUIRED/);
  assert.throws(() => resolveWebsiteAIEditOperation({ websiteEditTier: 'full' }), /WEBSITE_EDIT_TIER_REQUIRED/);
});
