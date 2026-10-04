import assert from 'node:assert/strict';
import test from 'node:test';
import { emitTrainingMetric, metricReason, setTrainingMetricSink, trainingMetricLine, type TrainingMetricLine } from '../../src/lib/training/training-metrics';

test('metric lines accept only closed label sets', () => {
  const line = trainingMetricLine('training_records_rejected_total', 1, { dataset: 'preference', stage: 'sanitize', reason: 'secret_detected' }, new Date('2026-10-03T00:00:00Z'));
  assert.deepEqual(line, { type: 'training_metric', name: 'training_records_rejected_total', value: 1, labels: { dataset: 'preference', stage: 'sanitize', reason: 'secret_detected' }, at: '2026-10-03T00:00:00.000Z' });
});

test('ids, emails, prompts and keys cannot become labels', () => {
  for (const labels of [
    { reason: 'user_2abcDEF' },
    { reason: 'ana@example.com' },
    { dataset: 'datasets/prompt-enhancement/v000001' },
    { user_id: 'u1' },
    { reason: 'a'.repeat(60) },
  ]) {
    assert.throws(() => trainingMetricLine('training_records_processed_total', 1, labels as never), /UNSAFE_TRAINING_METRIC_LABEL/);
  }
  assert.throws(() => trainingMetricLine('prompt_text_total' as never, 1), /UNKNOWN_TRAINING_METRIC/);
});

test('emitTrainingMetric drops invalid metrics instead of throwing', () => {
  const lines: TrainingMetricLine[] = [];
  const previous = setTrainingMetricSink((line) => lines.push(line));
  try {
    emitTrainingMetric('training_records_processed_total', 1, { reason: 'User@Example.com' } as never);
    emitTrainingMetric('training_records_processed_total', 1, { dataset: 'image-generation' });
  } finally {
    setTrainingMetricSink(previous);
  }
  assert.equal(lines.length, 1);
});

test('metricReason bounds internal codes', () => {
  assert.equal(metricReason('SECRET_DETECTED:aws_access_key'), 'secret_detected');
  assert.equal(metricReason(null), 'unknown');
});
