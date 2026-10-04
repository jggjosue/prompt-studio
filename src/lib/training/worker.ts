import 'server-only';
import type { SqsClient, SqsReceivedMessage } from '@/lib/aws/sqs-client';
import { TrainingSqsContractError, parseTrainingSqsMessage } from '@/lib/training-sqs-contract';
import { PermanentProcessingError, processTrainingMessage, type ProcessDeps } from '@/lib/training/processing';
import { emitTrainingMetric, metricReason } from '@/lib/training/training-metrics';

/**
 * Message handling for the training SQS consumer.
 *
 * Acknowledgement policy:
 * - processed / skipped / rejected / duplicate: delete (done).
 * - contract errors and PermanentProcessingError: delete, with the reason on
 *   the record and in metrics. Retrying cannot succeed.
 * - busy (another worker holds the record lease): shorten visibility so it
 *   is retried soon; not an error.
 * - anything else (Mongo, R2, network): leave the message. SQS redelivers it
 *   after the visibility timeout and moves it to the DLQ after maxReceiveCount
 *   (see infra/aws/training-queue.yaml).
 */
export type HandleResult = 'deleted' | 'retry' | 'retry-soon';

export async function handleTrainingQueueMessage(input: {
  message: SqsReceivedMessage;
  queueUrl: string;
  sqs: Pick<SqsClient, 'deleteMessage' | 'changeMessageVisibility'>;
  deps: ProcessDeps;
  visibilityTimeoutSeconds?: number;
  heartbeatMs?: number;
}): Promise<HandleResult> {
  const { message, queueUrl, sqs } = input;
  let parsed;
  try {
    parsed = parseTrainingSqsMessage(JSON.parse(message.Body));
  } catch (error) {
    const code = error instanceof TrainingSqsContractError ? error.code : 'INVALID_JSON';
    emitTrainingMetric('training_records_failed_total', 1, { stage: 'queue', reason: metricReason(code) });
    console.warn('[training-worker] discarding malformed message', { code, receiveCount: message.Attributes?.ApproximateReceiveCount ?? null });
    await sqs.deleteMessage(queueUrl, message.ReceiptHandle);
    return 'deleted';
  }

  const visibility = input.visibilityTimeoutSeconds ?? 300;
  const heartbeat = setInterval(() => {
    void sqs.changeMessageVisibility(queueUrl, message.ReceiptHandle, visibility).catch(() => undefined);
  }, input.heartbeatMs ?? Math.max(10_000, (visibility * 1000) / 3));
  try {
    const outcome = await processTrainingMessage(parsed, input.deps);
    if (outcome.status === 'busy') {
      await sqs.changeMessageVisibility(queueUrl, message.ReceiptHandle, 30).catch(() => undefined);
      return 'retry-soon';
    }
    await sqs.deleteMessage(queueUrl, message.ReceiptHandle);
    return 'deleted';
  } catch (error) {
    if (error instanceof PermanentProcessingError) {
      console.warn('[training-worker] permanent failure', { code: error.code, entityType: parsed.entityType });
      await sqs.deleteMessage(queueUrl, message.ReceiptHandle);
      return 'deleted';
    }
    // Error class and code only: messages may embed keys or provider details.
    const code = (error as { code?: unknown })?.code;
    console.error('[training-worker] transient failure, message will be redelivered', {
      error: error instanceof Error ? error.name : 'unknown',
      code: typeof code === 'string' || typeof code === 'number' ? code : null,
      receiveCount: message.Attributes?.ApproximateReceiveCount ?? null,
    });
    emitTrainingMetric('training_records_failed_total', 1, { stage: 'queue', reason: 'transient' });
    return 'retry';
  } finally {
    clearInterval(heartbeat);
  }
}

/** Publishes queue and DLQ depth as metrics (no labels beyond the queue role). */
export async function reportQueueDepth(sqs: Pick<SqsClient, 'queueDepth'>, queueUrl: string, dlqUrl: string | null) {
  const main = await sqs.queueDepth(queueUrl);
  emitTrainingMetric('training_queue_depth', main.visible + main.delayed, { queue: 'main' });
  if (dlqUrl) {
    const dlq = await sqs.queueDepth(dlqUrl);
    emitTrainingMetric('training_dlq_depth', dlq.visible, { queue: 'dlq' });
    return { main, dlq };
  }
  return { main, dlq: null };
}
