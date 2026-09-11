import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateModelCreditCost, validateCreditCost } from '../../src/lib/generation-pricing';

test('validateCreditCost always returns a strictly positive number', () => {
  assert.equal(validateCreditCost(0), 1.0);
  assert.equal(validateCreditCost(-5), 1.0);
  assert.equal(validateCreditCost(NaN), 1.0);
  assert.equal(validateCreditCost(2.5), 2.5);
  assert.ok(validateCreditCost(0.1) > 0);
});

test('calculateModelCreditCost returns positive model-dependent costs for Gemini', () => {
  const flashWebCost = calculateModelCreditCost('ai-web', 'google', 'gemini-2.5-flash');
  const proWebCost = calculateModelCreditCost('ai-web', 'google', 'gemini-2.5-pro');
  const flash15WebCost = calculateModelCreditCost('ai-web', 'google', 'gemini-1.5-flash');

  assert.ok(flashWebCost > 0, 'Gemini 2.5 Flash cost must be positive');
  assert.ok(proWebCost > 0, 'Gemini 2.5 Pro cost must be positive');
  assert.ok(flash15WebCost > 0, 'Gemini 1.5 Flash cost must be positive');

  assert.ok(proWebCost > flashWebCost, 'Gemini Pro should cost more than Gemini Flash for Web');
  assert.ok(flashWebCost >= flash15WebCost, 'Gemini 2.5 Flash should cost at least as much as 1.5 Flash');
});

test('calculateModelCreditCost returns positive costs across all generation tabs', () => {
  const tabs = ['ai-web', 'ai-image', 'ai-video', 'ai-chat'];
  const models = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];

  for (const tab of tabs) {
    for (const model of models) {
      const cost = calculateModelCreditCost(tab, 'google', model);
      assert.ok(cost > 0, `Cost for ${tab} with ${model} must be positive, got ${cost}`);
    }
  }
});
