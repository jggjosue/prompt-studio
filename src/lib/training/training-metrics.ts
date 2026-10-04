import { DATASET_NAMES } from '@/lib/dataset-object-contract';
import { TRAINING_ENTITY_TYPES } from '@/lib/training-data-contract';
import { TRAINING_MODALITIES } from '@/lib/training/modalities';

/**
 * Training pipeline metrics as structured log lines (`type: training_metric`),
 * collected by the log platform of each runtime (Workers Logs, CloudWatch for
 * the ECS worker, CI logs for releases).
 *
 * Cardinality and privacy are enforced, not documented: metric names and every
 * label value come from closed sets. Record IDs, user IDs, emails, prompt text,
 * R2 keys and credentials cannot be emitted because no label accepts them.
 */
export const TRAINING_METRICS = [
  'training_events_captured_total',
  'training_events_rejected_total',
  'training_queue_enqueued_total',
  'training_queue_enqueue_failed_total',
  'training_outbox_swept_total',
  'training_queue_depth',
  'training_dlq_depth',
  'training_queue_oldest_message_age_seconds',
  'training_records_processed_total',
  'training_records_rejected_total',
  'training_records_duplicate_total',
  'training_records_skipped_total',
  'training_records_failed_total',
  'training_quality_rejected_total',
  'training_processing_latency_ms',
  'training_examples_written_total',
  'training_r2_bytes_written_total',
  'training_r2_operations_total',
  'dataset_examples_total',
  'dataset_release_duration_ms',
  'dataset_release_success_total',
  'dataset_release_failure_total',
] as const;
export type TrainingMetricName = (typeof TRAINING_METRICS)[number];

const LABELS: Record<string, readonly string[] | RegExp> = {
  dataset: DATASET_NAMES,
  entity_type: TRAINING_ENTITY_TYPES,
  modality: TRAINING_MODALITIES,
  stage: ['capture', 'queue', 'eligibility', 'sanitize', 'validate', 'dedupe', 'quality', 'normalize', 'write', 'release', 'retrieve'],
  result: ['success', 'failure', 'enqueued', 'failed', 'rejected', 'duplicate', 'skipped'],
  queue: ['main', 'dlq'],
  operation: ['put', 'get', 'head', 'list', 'delete', 'copy'],
  source: ['client', 'server'],
  // Our own stable codes (e.g. secret_detected, consent_missing). Bounded by code, not by data.
  reason: /^[a-z0-9_]{1,48}$/,
};

export type TrainingMetricLabels = Partial<Record<keyof typeof LABELS, string>>;
export type TrainingMetricLine = { type: 'training_metric'; name: TrainingMetricName; value: number; labels: Record<string, string>; at: string };

let sink: (line: TrainingMetricLine) => void = (line) => console.error(JSON.stringify(line));

/** Replace the output (tests, or a future metrics exporter). Returns the previous sink. */
export function setTrainingMetricSink(next: (line: TrainingMetricLine) => void) {
  const previous = sink;
  sink = next;
  return previous;
}

export function trainingMetricLine(name: TrainingMetricName, value: number, labels: TrainingMetricLabels = {}, at = new Date()): TrainingMetricLine {
  if (!(TRAINING_METRICS as readonly string[]).includes(name)) throw new Error('UNKNOWN_TRAINING_METRIC');
  if (!Number.isFinite(value) || value < 0) throw new Error('INVALID_TRAINING_METRIC_VALUE');
  const safe: Record<string, string> = {};
  for (const [key, raw] of Object.entries(labels)) {
    if (raw === undefined || raw === null) continue;
    const rule = LABELS[key];
    const value = String(raw);
    const allowed = rule instanceof RegExp ? rule.test(value) : rule?.includes(value);
    if (!allowed) throw new Error(`UNSAFE_TRAINING_METRIC_LABEL:${key}`);
    safe[key] = value;
  }
  return { type: 'training_metric', name, value, labels: safe, at: at.toISOString() };
}

/** Emits a metric. Never throws: an invalid label drops the metric, not the caller. */
export function emitTrainingMetric(name: TrainingMetricName, value: number, labels: TrainingMetricLabels = {}) {
  try {
    sink(trainingMetricLine(name, value, labels));
  } catch {
    // Observability must not break the pipeline.
  }
}

/** Normalizes an internal error/skip code into a bounded metric reason. */
export function metricReason(code: string | null | undefined) {
  return (code ?? 'unknown').toLowerCase().split(':')[0].replace(/[^a-z0-9_]/g, '_').slice(0, 48) || 'unknown';
}
