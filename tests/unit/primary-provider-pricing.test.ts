import test from 'node:test';
import assert from 'node:assert/strict';

const { getAIModelConfig, resolveAIModelId } = await import('../../src/lib/ai-credit-config.ts');

test('primary text/project providers use verified current pricing', () => {
  const gemini = getAIModelConfig('google', 'gemini-2.5-flash');
  const vertex = getAIModelConfig('vertex', 'gemini-2.5-flash');
  const openai = getAIModelConfig('openai', 'gpt-5.4-mini');
  assert.equal(gemini?.pricingStatus, 'verified');
  assert.equal(vertex?.inputTokenPriceUsdPerMillion, 0.30);
  assert.equal(vertex?.outputTokenPriceUsdPerMillion, 2.50);
  assert.equal(openai?.inputTokenPriceUsdPerMillion, 0.75);
  assert.equal(openai?.outputTokenPriceUsdPerMillion, 4.50);
  assert.equal(resolveAIModelId('project', 'openai'), 'gpt-5.4-mini');
});

test('video models are not constrained by the old 100-credit generic cap', () => {
  assert.equal(getAIModelConfig('google', 'veo-3.1-fast-generate-preview')?.maxCredits, 5000);
  assert.equal(getAIModelConfig('vertex', 'veo-3.1-fast-generate-001')?.maxCredits, 5000);
  assert.equal(getAIModelConfig('openai', 'sora-2'), null);
});
