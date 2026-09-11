import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateBudgetOperation, projectBudgetSnapshot, type ProjectBudget } from '../../src/lib/project-budget.ts';

const budget: ProjectBudget = { limitCredits: 10, limitUsd: 2, warningPercent: 80, approvalCredits: 3, approvalUsd: 1 };
const jobs = [{ kind: 'image', provider: 'google', status: 'completed', creditsState: 'captured', creditCost: 7, estimatedCostUsd: .7, actualCostUsd: .8 }];

test('project budget reports consumption, projection and warning threshold', () => {
  const snapshot = projectBudgetSnapshot(budget, jobs);
  assert.equal(snapshot.consumedCredits, 7);
  assert.equal(snapshot.actualUsd, .8);
  assert.equal(snapshot.warnings.length, 0);
});

test('project budget blocks operations exceeding either hard limit', () => {
  const decision = evaluateBudgetOperation(budget, jobs, { credits: 4, estimatedUsd: .2 }, true);
  assert.equal(decision.allowed, false);
  assert.equal(decision.exceedsCredits, true);
});

test('costly operations require explicit approval before execution', () => {
  const pending = evaluateBudgetOperation(budget, [], { credits: 3, estimatedUsd: .2 }, false);
  assert.equal(pending.approvalRequired, true);
  assert.equal(pending.allowed, false);
  assert.equal(evaluateBudgetOperation(budget, [], { credits: 3, estimatedUsd: .2 }, true).allowed, true);
});
