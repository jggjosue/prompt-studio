export const DATASET_OBSERVABILITY_VERSION = 'observability-v1';

export const DATASET_METRICS = [
  'records_processed_total','records_rejected_total','records_duplicate_total','processing_duration_ms',
  'queue_depth','dlq_depth','examples_total','r2_bytes_written_total','r2_operations_total',
  'release_duration_ms','release_success_total','release_failure_total',
] as const;
export type DatasetMetricName = (typeof DATASET_METRICS)[number];
export type MetricLabels = {
  dataset?: 'prompt-enhancement'|'preference'|'image-generation'|'video-generation'|'web-generation';
  stage?: 'queue'|'preprocess'|'build'|'validate'|'release';
  result?: 'success'|'failure'|'rejected'|'duplicate';
  reason?: string;
};

function safeLabel(value: string) {
  if (!/^[a-z0-9_.:-]{1,64}$/i.test(value)) throw new Error('UNSAFE_METRIC_LABEL');
  return value;
}

export function datasetMetric(input: { name: DatasetMetricName; value: number; labels?: MetricLabels; at?: string }) {
  if (!DATASET_METRICS.includes(input.name) || !Number.isFinite(input.value) || input.value < 0) throw new Error('INVALID_DATASET_METRIC');
  const labels = Object.fromEntries(Object.entries(input.labels ?? {}).map(([k,v]) => [k, safeLabel(String(v))]));
  return { version: DATASET_OBSERVABILITY_VERSION, name: input.name, value: input.value, labels, at: input.at ?? new Date().toISOString() };
}

export function emitDatasetMetric(input: Parameters<typeof datasetMetric>[0]) {
  const metric = datasetMetric(input);
  // Structured stdout is collected by the runtime/log platform; never include record IDs, prompts, users, keys or secrets.
  console.log(JSON.stringify({ type: 'dataset_metric', ...metric }));
  return metric;
}

export async function observeDatasetOperation<T>(input: {
  stage: NonNullable<MetricLabels['stage']>;
  dataset?: MetricLabels['dataset'];
  successMetric?: DatasetMetricName;
  failureMetric?: DatasetMetricName;
  durationMetric?: DatasetMetricName;
  operation: () => Promise<T>;
}) {
  const started = Date.now();
  try {
    const result = await input.operation();
    if (input.successMetric) emitDatasetMetric({ name: input.successMetric, value: 1, labels: { stage: input.stage, dataset: input.dataset, result: 'success' } });
    return result;
  } catch (error) {
    if (input.failureMetric) emitDatasetMetric({ name: input.failureMetric, value: 1, labels: { stage: input.stage, dataset: input.dataset, result: 'failure' } });
    throw error;
  } finally {
    if (input.durationMetric) emitDatasetMetric({ name: input.durationMetric, value: Date.now() - started, labels: { stage: input.stage, dataset: input.dataset } });
  }
}
