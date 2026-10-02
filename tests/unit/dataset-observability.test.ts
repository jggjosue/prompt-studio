import assert from 'node:assert/strict';
import test from 'node:test';
import { datasetMetric, DATASET_OBSERVABILITY_VERSION } from '../../src/lib/dataset-observability';
import { evaluateDatasetPipelineAlerts, queueMetrics } from '../../src/lib/dataset-pipeline-health';

test('metric contract is versioned and accepts low-cardinality labels', () => {
  const metric = datasetMetric({ name: 'examples_total', value: 10, labels: { dataset: 'preference', stage: 'build' }, at: '2026-10-02T00:00:00.000Z' });
  assert.equal(metric.version, DATASET_OBSERVABILITY_VERSION);
  assert.equal(metric.labels.dataset, 'preference');
});

test('unsafe metric labels fail closed', () => {
  assert.throws(() => datasetMetric({ name: 'records_rejected_total', value: 1, labels: { reason: 'secret value with spaces' } }), /UNSAFE_METRIC_LABEL/);
});

test('queue and DLQ thresholds produce alerts', () => {
  const alerts = evaluateDatasetPipelineAlerts({ queueDepth: 1200, dlqDepth: 1, processed: 100, rejected: 0, failed: 0, windowMinutes: 15 });
  assert.ok(alerts.some((a) => a.code === 'TRAINING_QUEUE_STALLED'));
  assert.ok(alerts.some((a) => a.code === 'TRAINING_DLQ_NONEMPTY'));
});

test('rate alerts require minimum sample and cross thresholds', () => {
  assert.equal(evaluateDatasetPipelineAlerts({ queueDepth: 0, dlqDepth: 0, processed: 5, rejected: 5, failed: 0, windowMinutes: 15 }).length, 0);
  const alerts = evaluateDatasetPipelineAlerts({ queueDepth: 0, dlqDepth: 0, processed: 60, rejected: 30, failed: 10, windowMinutes: 15 });
  assert.ok(alerts.some((a) => a.code === 'TRAINING_REJECTION_RATE_HIGH'));
  assert.ok(alerts.some((a) => a.code === 'TRAINING_FAILURE_RATE_HIGH'));
});

test('queue metrics never contain queue URLs', () => {
  const metrics = queueMetrics(3, 0);
  assert.deepEqual(metrics.map((m) => m.value), [3, 0]);
  assert.equal(JSON.stringify(metrics).includes('https://'), false);
});
