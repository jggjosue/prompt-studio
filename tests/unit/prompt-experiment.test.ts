import assert from 'node:assert/strict';
import test from 'node:test';
import { experimentMetrics, experimentRunKey, outputUrl } from '../../src/lib/prompt-experiment.ts';

test('the matrix produces stable run identifiers', () => {
  assert.equal(experimentRunKey('A', 'google'), 'A-google');
  assert.equal(experimentRunKey('B', 'openai'), 'B-openai');
});

test('experiment metrics expose real duration, cost and bounded worker scores', () => {
  const metrics = experimentMetrics({ createdAt: '2026-01-01T00:00:00Z', completedAt: '2026-01-01T00:00:02Z', estimatedCostUsd: 0.04, result: { evaluation: { fidelity: 104, quality: 81.4 } } });
  assert.deepEqual(metrics, { durationMs: 2000, costUsd: 0.04, fidelity: 100, quality: 81 });
});

test('missing evaluations remain null and are never fabricated', () => {
  const metrics = experimentMetrics({ createdAt: new Date(), estimatedCostUsd: 0.04, result: { imageUrl: '/result.png' } });
  assert.equal(metrics.fidelity, null);
  assert.equal(metrics.quality, null);
  assert.equal(outputUrl({ imageUrl: '/result.png' }), '/result.png');
});
