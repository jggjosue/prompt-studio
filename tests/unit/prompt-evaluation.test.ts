import assert from 'node:assert/strict';
import test from 'node:test';
import { boundedScore, compareVersions, evaluationScores, signalsByVersion } from '../../src/lib/prompt-evaluation.ts';

const jobs = [
  { promptVersionId: 'a1', promptVersionNumber: 1, status: 'completed', actualCostUsd: 0.04, actualDurationMs: 2000, result: { evaluation: { quality: 81.4, fidelity: 104 } } },
  { promptVersionId: 'a1', promptVersionNumber: 1, status: 'queued', estimatedCostUsd: 0.04 },
  { promptVersionNumber: 2, status: 'completed', actualCostUsd: 0.02, actualDurationMs: 4000, result: { evaluation: { quality: 95, fidelity: 88 } } },
];

const feedbacks = [
  { promptVersionNumber: 1, useful: true, rating: 5, reason: null },
  { promptVersionNumber: 1, useful: false, rating: 2, reason: 'baja-calidad' },
  { promptVersionNumber: 1, useful: false, rating: null, reason: 'lento' },
  { promptVersionNumber: 2, useful: false, rating: 3, reason: 'lento' },
];

test('scores are bounded between 0 and 100', () => {
  assert.equal(boundedScore(104), 100);
  assert.equal(boundedScore(81.4), 81);
  assert.equal(boundedScore(-3), 0);
  assert.equal(boundedScore('n/a'), null);
});

test('worker evaluations are extracted from result.evaluation', () => {
  assert.deepEqual(evaluationScores({ evaluation: { quality: 95, fidelity: 88 } }), { quality: 95, fidelity: 88 });
  assert.deepEqual(evaluationScores({ imageUrl: '/x.png' }), { quality: null, fidelity: null });
});

test('signals aggregate completed jobs and feedback per version', () => {
  const signals = signalsByVersion(jobs, feedbacks, 1);
  assert.equal(signals?.jobCount, 2);
  assert.equal(signals?.completedCount, 1);
  assert.equal(signals?.quality, 81);
  assert.equal(signals?.fidelity, 100);
  assert.equal(signals?.costUsd, 0.04);
  assert.equal(signals?.latencyMs, 2000);
  assert.deepEqual(signals?.feedback, { count: 3, useful: 1, ratingAvg: 3.5, reasons: { 'baja-calidad': 1, lento: 1 } });
});

test('a version without jobs or feedback has no signals at all', () => {
  assert.equal(signalsByVersion(jobs, feedbacks, 9), null);
});

test('comparison only judges axes where both versions have a signal', () => {
  const a = signalsByVersion(jobs, feedbacks, 1) as ReturnType<typeof signalsByVersion>;
  const b = signalsByVersion(jobs, feedbacks, 2) as ReturnType<typeof signalsByVersion>;
  assert.ok(a && b);
  const result = compareVersions(a, b);
  const axes = Object.fromEntries(result.axes.map((item) => [item.axis, item.winner]));
  assert.deepEqual(axes, { quality: 'b', fidelity: 'a', costUsd: 'b', latencyMs: 'a', rating: 'a' });
  assert.equal(result.judgedAxes, 5);
});

test('axes with a missing value on either side are not compared', () => {
  const lone = signalsByVersion([{ promptVersionNumber: 3, status: 'completed' }], [], 3) as NonNullable<ReturnType<typeof signalsByVersion>>;
  const a = signalsByVersion(jobs, feedbacks, 1) as NonNullable<ReturnType<typeof signalsByVersion>>;
  const result = compareVersions(a, lone);
  assert.equal(result.judgedAxes, 0);
  assert.deepEqual(result.axes, []);
});