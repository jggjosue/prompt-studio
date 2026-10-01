import test from 'node:test';
import assert from 'node:assert/strict';

// This test intentionally imports the server-owned catalog. It validates the
// commercial Prompt Credit contract without depending on provider pricing.
const {
  AI_OPERATION_CATALOG,
  AI_OPERATION_CODES,
  getAIOperation,
  getAIOperationCreditCost,
  getAIOperationsByCategory,
  getEnabledAIOperation,
  isAIOperationCode,
} = await import('../../src/lib/ai-operation-catalog');

test('operation catalog has unique stable codes', () => {
  assert.equal(new Set(AI_OPERATION_CODES).size, AI_OPERATION_CODES.length);
  for (const code of AI_OPERATION_CODES) assert.equal(AI_OPERATION_CATALOG[code].code, code);
});

test('component preview is free', () => {
  const preview = getAIOperation('COMPONENT_PREVIEW');
  assert.equal(preview.creditCost, 0);
  assert.equal(preview.isFree, true);
});

test('agreed image and video prices are authoritative', () => {
  assert.equal(getAIOperationCreditCost('IMAGE_LITE_1K'), 15);
  assert.equal(getAIOperationCreditCost('IMAGE_QUALITY_4K'), 70);
  assert.equal(getAIOperationCreditCost('VIDEO_LITE_720_8S'), 180);
  assert.equal(getAIOperationCreditCost('VIDEO_FAST_1080_8S'), 430);
  assert.equal(getAIOperationCreditCost('VIDEO_PREMIUM_8S'), 1425);
});

test('unknown operation identifiers are rejected', () => {
  assert.equal(isAIOperationCode('TEXT_SHORT'), true);
  assert.equal(isAIOperationCode('NOT_REAL'), false);
  assert.equal(getEnabledAIOperation('NOT_REAL'), null);
});

test('category query returns enabled operations only', () => {
  const images = getAIOperationsByCategory('image');
  assert.equal(images.length, 4);
  assert.equal(images.every((item) => item.category === 'image' && item.enabled), true);
});

test('project code audit is variable with a 50 credit floor', () => {
  const audit = getAIOperation('CODE_AUDIT_PROJECT');
  assert.equal(audit.variablePricing, true);
  assert.equal(audit.creditCost, 50);
});

test('billable operations default to 75 percent minimum margin', () => {
  assert.equal(getAIOperation('TEXT_SHORT').minimumMarginPercent, 75);
  assert.equal(getAIOperation('VIDEO_PREMIUM_8S').minimumMarginPercent, 75);
});
