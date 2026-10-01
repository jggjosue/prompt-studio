import test from 'node:test';
import assert from 'node:assert/strict';

const {
  isPromptOptimizerTier,
  resolvePromptOptimizerOperation,
} = await import('../../src/lib/prompt-optimizer-operation');

test('maps Prompt Optimizer tiers to authoritative credit operations', () => {
  const basic = resolvePromptOptimizerOperation({ optimizerTier: 'basic' });
  const advanced = resolvePromptOptimizerOperation({ optimizerTier: 'advanced' });
  const complex = resolvePromptOptimizerOperation({ optimizerTier: 'complex' });

  assert.equal(basic.code, 'PROMPT_OPTIMIZER_BASIC');
  assert.equal(basic.creditCost, 2);
  assert.equal(advanced.code, 'PROMPT_OPTIMIZER_ADVANCED');
  assert.equal(advanced.creditCost, 5);
  assert.equal(complex.code, 'PROMPT_OPTIMIZER_COMPLEX');
  assert.equal(complex.creditCost, 8);
});

test('rejects unknown or missing Prompt Optimizer tiers', () => {
  assert.equal(isPromptOptimizerTier('basic'), true);
  assert.equal(isPromptOptimizerTier('premium'), false);
  assert.throws(() => resolvePromptOptimizerOperation({}), /PROMPT_OPTIMIZER_TIER_REQUIRED/);
  assert.throws(() => resolvePromptOptimizerOperation({ optimizerTier: 'premium' }), /PROMPT_OPTIMIZER_TIER_REQUIRED/);
});
