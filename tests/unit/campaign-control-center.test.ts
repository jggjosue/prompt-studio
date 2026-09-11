import test from 'node:test';
import assert from 'node:assert/strict';
import { campaignControlCenter } from '../../src/lib/campaign-control-center.ts';

const job = (overrides = {}) => ({ status: 'completed', progress: 100, creditCost: 2, estimatedCostUsd: .08, actualCostUsd: .06, feedbackUseful: true, ...overrides });

test('campaign center reports the complete journey and real costs', () => {
  const result = campaignControlCenter({ brief: 'A sufficiently detailed campaign brief', brandConfigured: true, promptCount: 6, jobs: [job(), job()], publicationCount: 1 });
  assert.equal(result.progress, 100);
  assert.equal(result.costs.credits, 4);
  assert.equal(result.costs.actualUsd, .12);
  assert.equal(result.nextAction.stage, 'complete');
});

test('campaign center recommends the first unfinished stage', () => {
  const result = campaignControlCenter({ brief: 'A sufficiently detailed campaign brief', brandConfigured: false, promptCount: 6, jobs: [job({ status: 'queued', progress: 0, actualCostUsd: null, feedbackUseful: null })], publicationCount: 0 });
  assert.equal(result.nextAction.stage, 'brand');
  assert.equal(result.stages.find(stage => stage.key === 'generations')?.status, 'pending');
  assert.equal(result.costs.actualUsd, null);
});

test('failed generations block the journey and produce a retry action', () => {
  const result = campaignControlCenter({ brief: 'A sufficiently detailed campaign brief', brandConfigured: true, promptCount: 6, jobs: [job({ status: 'failed', progress: 100, actualCostUsd: null, feedbackUseful: null })], publicationCount: 0 });
  assert.equal(result.stages.find(stage => stage.key === 'generations')?.status, 'blocked');
  assert.match(result.pending.join(' '), /Reintentar/);
});
