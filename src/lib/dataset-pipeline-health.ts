import { datasetMetric } from '@/lib/dataset-observability';

export type DatasetPipelineSnapshot = {
  queueDepth: number;
  dlqDepth: number;
  processed: number;
  rejected: number;
  failed: number;
  windowMinutes: number;
};

export function evaluateDatasetPipelineAlerts(snapshot: DatasetPipelineSnapshot) {
  const alerts: { code: string; severity: 'warning'|'critical'; value: number }[] = [];
  const attempts = snapshot.processed + snapshot.rejected + snapshot.failed;
  const rejectionRate = attempts ? snapshot.rejected / attempts : 0;
  const failureRate = attempts ? snapshot.failed / attempts : 0;
  if (snapshot.queueDepth >= 1000) alerts.push({ code: 'TRAINING_QUEUE_STALLED', severity: 'warning', value: snapshot.queueDepth });
  if (snapshot.dlqDepth > 0) alerts.push({ code: 'TRAINING_DLQ_NONEMPTY', severity: 'critical', value: snapshot.dlqDepth });
  if (attempts >= 20 && rejectionRate >= 0.25) alerts.push({ code: 'TRAINING_REJECTION_RATE_HIGH', severity: 'warning', value: rejectionRate });
  if (attempts >= 20 && failureRate >= 0.10) alerts.push({ code: 'TRAINING_FAILURE_RATE_HIGH', severity: 'critical', value: failureRate });
  return alerts;
}

export function queueMetrics(queueDepth: number, dlqDepth: number) {
  return [
    datasetMetric({ name: 'queue_depth', value: queueDepth, labels: { stage: 'queue' } }),
    datasetMetric({ name: 'dlq_depth', value: dlqDepth, labels: { stage: 'queue' } }),
  ];
}
