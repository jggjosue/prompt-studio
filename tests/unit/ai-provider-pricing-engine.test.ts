import test from 'node:test';
import assert from 'node:assert/strict';

const {
  DEFAULT_SAFETY_BUFFER_PERCENT,
  PROMPT_CREDIT_COMMERCIAL_VALUE_USD,
  estimateProviderCost,
  evaluateOperationMargin,
} = await import('../../src/lib/ai-provider-pricing-engine');

test('uses one cent as commercial value per Prompt Credit', () => {
  assert.equal(PROMPT_CREDIT_COMMERCIAL_VALUE_USD, 0.01);
});

test('estimates verified image provider cost with safety buffer', () => {
  const estimate = estimateProviderCost('google', 'imagen-4.0-fast-generate-001', { imageCount: 1 });
  assert.ok(estimate);
  assert.equal(estimate.rawProviderCostUsd, 0.04);
  assert.equal(estimate.safetyCostUsd, 0.045);
  assert.equal(estimate.safetyBufferPercent, DEFAULT_SAFETY_BUFFER_PERCENT);
  assert.equal(estimate.costKnown, true);
});

test('allows a 30-credit image operation when provider cost fits 75 percent margin target', () => {
  const result = evaluateOperationMargin({
    operationCredits: 30,
    provider: 'google',
    modelId: 'imagen-4.0-fast-generate-001',
    usage: { imageCount: 1 },
  });
  assert.equal(result.commercialValueUsd, 0.3);
  assert.equal(result.maximumProviderCostUsd, 0.075);
  assert.equal(result.safetyCostUsd, 0.045);
  assert.equal(result.eligible, true);
  assert.equal(result.reason, 'ELIGIBLE');
  assert.equal(result.estimatedMarginPercent, 85);
});

test('blocks a provider when safety cost exceeds the operation margin budget', () => {
  const result = evaluateOperationMargin({
    operationCredits: 10,
    provider: 'google',
    modelId: 'imagen-4.0-fast-generate-001',
    usage: { imageCount: 1 },
  });
  assert.equal(result.maximumProviderCostUsd, 0.025);
  assert.equal(result.safetyCostUsd, 0.045);
  assert.equal(result.eligible, false);
  assert.equal(result.reason, 'PROVIDER_COST_EXCEEDS_MARGIN');
});

test('fails closed when provider pricing is unknown', () => {
  const result = evaluateOperationMargin({
    operationCredits: 180,
    provider: 'google',
    modelId: 'veo-3.1-generate-001',
    usage: { videoDurationSeconds: 8 },
  });
  assert.equal(result.costKnown, false);
  assert.equal(result.eligible, false);
  assert.equal(result.reason, 'PROVIDER_COST_UNKNOWN');
});

test('fails closed for a model that is not allowlisted', () => {
  const result = evaluateOperationMargin({
    operationCredits: 30,
    provider: 'unknown',
    modelId: 'not-real',
  });
  assert.equal(result.eligible, false);
  assert.equal(result.reason, 'MODEL_NOT_ALLOWED');
});

test('does not require provider cost for a free non-provider operation', () => {
  const result = evaluateOperationMargin({
    operationCredits: 0,
    provider: 'internal',
    modelId: 'component-preview',
  });
  assert.equal(result.eligible, true);
  assert.equal(result.reason, 'FREE_OPERATION');
  assert.equal(result.estimatedMarginPercent, 100);
});

test('rejects invalid negative operation prices', () => {
  const result = evaluateOperationMargin({
    operationCredits: -1,
    provider: 'google',
    modelId: 'imagen-4.0-fast-generate-001',
  });
  assert.equal(result.eligible, false);
  assert.equal(result.reason, 'INVALID_OPERATION_PRICE');
});
