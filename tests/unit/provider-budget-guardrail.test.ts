import test from 'node:test';
import assert from 'node:assert/strict';

const {
  MAX_PROVIDER_COST_PER_CREDIT_USD,
  evaluateProviderBudget,
  assertProviderBudget,
} = await import('../../src/lib/credit-economics.ts');

test('provider budget remains $0.0025 per Prompt Credit', () => {
  assert.equal(MAX_PROVIDER_COST_PER_CREDIT_USD, 0.0025);
  const check = evaluateProviderBudget(30, 0.075);
  assert.equal(check.providerBudgetUsd, 0.075);
  assert.equal(check.eligible, true);
  assert.equal(check.utilizationPercent, 100);
});

test('provider estimate above the operation budget is rejected', () => {
  const check = evaluateProviderBudget(30, 0.09);
  assert.equal(check.eligible, false);
  assert.equal(check.providerBudgetUsd, 0.075);
  assert.equal(check.remainingBudgetUsd, -0.015);
  assert.throws(() => assertProviderBudget(30, 0.09), /PROVIDER_COST_EXCEEDS_CREDIT_BUDGET/);
});

test('provider estimate below budget exposes remaining provider margin', () => {
  const check = evaluateProviderBudget(50, 0.05);
  assert.equal(check.eligible, true);
  assert.equal(check.providerBudgetUsd, 0.125);
  assert.equal(check.remainingBudgetUsd, 0.075);
  assert.equal(check.utilizationPercent, 40);
});
