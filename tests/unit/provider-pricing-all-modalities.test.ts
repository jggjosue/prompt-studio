import test from 'node:test';
import assert from 'node:assert/strict';

const { quoteImageProviderCost, creditsForProtectedProviderCost } = await import('../../src/lib/provider-pricing-registry.ts');

test('Gemini Flash Image credits scale with output resolution', () => {
  assert.equal(quoteImageProviderCost({ provider: 'google', modelId: 'gemini-3.1-flash-image', resolution: '1k' })?.requiredCredits, 31);
  assert.equal(quoteImageProviderCost({ provider: 'google', modelId: 'gemini-3.1-flash-image', resolution: '2k' })?.requiredCredits, 46);
  assert.equal(quoteImageProviderCost({ provider: 'google', modelId: 'gemini-3.1-flash-image', resolution: '4k' })?.requiredCredits, 68);
});

test('Gemini Pro Image 4K receives a higher protected credit quote', () => {
  assert.equal(quoteImageProviderCost({ provider: 'google', modelId: 'gemini-3-pro-image', resolution: '1k' })?.requiredCredits, 61);
  assert.equal(quoteImageProviderCost({ provider: 'google', modelId: 'gemini-3-pro-image', resolution: '4k' })?.requiredCredits, 108);
});

test('token-priced modalities use the same protected cost conversion', () => {
  assert.equal(creditsForProtectedProviderCost(0.01), 5);
  assert.equal(creditsForProtectedProviderCost(0.10), 45);
});
