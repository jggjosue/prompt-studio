import 'server-only';
import { SqsClient, regionFromQueueUrl } from '@/lib/aws/sqs-client';
import type { TrainingEntityType } from '@/lib/training-data-contract';
import { createTrainingSqsMessage } from '@/lib/training-sqs-contract';
import { emitTrainingMetric } from '@/lib/training/training-metrics';
import TrainingDataRecord from '@/models/TrainingDataRecord';

/**
 * Producer side of the training queue (Amazon SQS) plus the outbox sweep.
 *
 * Responsibility split with Cloudflare Queues: Cloudflare carries generation
 * jobs (`prompt-studio-ai-jobs`); SQS carries training-data records only. No
 * message is ever published to both.
 *
 * Delivery model: the MongoDB record is written first (pipeline.status =
 * captured), then a message is sent. If sending fails or the queue is not
 * configured, the record stays `captured` and `sweepTrainingOutbox` re-sends
 * it later. Consumers are idempotent, so the occasional duplicate is harmless.
 */

let cachedClient: { key: string; client: SqsClient } | null = null;

export function trainingQueueUrl(env: Record<string, string | undefined> = process.env): string | null {
  return env.AWS_TRAINING_SQS_QUEUE_URL?.trim() || null;
}

function client(queueUrl: string): SqsClient {
  const region = process.env.AWS_REGION?.trim() || regionFromQueueUrl(queueUrl);
  const key = `${queueUrl}|${region}`;
  if (!cachedClient || cachedClient.key !== key) cachedClient = { key, client: new SqsClient({ region }) };
  return cachedClient.client;
}

export type EnqueueResult = { enqueued: true; messageId: string } | { enqueued: false; code: string };

/**
 * Sends one process-record message and marks the record queued. Never throws:
 * failures are recorded on the record for the outbox sweep.
 */
export async function enqueueTrainingRecord(record: {
  recordId: string;
  entityType: TrainingEntityType;
  correlationId?: string | null;
  generationId?: string | null;
}, reason: string, deps: { sqs?: SqsClient; queueUrl?: string | null; now?: Date } = {}): Promise<EnqueueResult> {
  const queueUrl = deps.queueUrl === undefined ? trainingQueueUrl() : deps.queueUrl;
  const filter = { entityType: record.entityType, recordId: record.recordId };
  if (!queueUrl) {
    await TrainingDataRecord.updateOne(filter, { $set: { 'pipeline.lastCode': 'QUEUE_NOT_CONFIGURED' } }).catch(() => undefined);
    return { enqueued: false, code: 'QUEUE_NOT_CONFIGURED' };
  }
  const now = deps.now ?? new Date();
  try {
    const message = createTrainingSqsMessage({
      recordId: record.recordId,
      entityType: record.entityType,
      correlationId: record.correlationId ?? null,
      generationId: record.generationId ?? null,
      idempotencyKey: `${record.recordId}:${reason}`.slice(0, 160).replace(/[^A-Za-z0-9:_-]/g, '_'),
      now,
    });
    const sent = await (deps.sqs ?? client(queueUrl)).sendMessage(queueUrl, JSON.stringify(message));
    await TrainingDataRecord.updateOne(filter, {
      $set: { 'pipeline.status': 'queued', 'pipeline.enqueuedAt': now, 'pipeline.lastCode': null },
    });
    emitTrainingMetric('training_queue_enqueued_total', 1, { entity_type: record.entityType });
    return { enqueued: true, messageId: sent.MessageId };
  } catch (error) {
    const code = error instanceof Error ? error.message.split(':').slice(0, 2).join(':').slice(0, 120) : 'ENQUEUE_FAILED';
    await TrainingDataRecord.updateOne(filter, { $set: { 'pipeline.lastCode': `ENQUEUE_FAILED:${code}` } }).catch(() => undefined);
    emitTrainingMetric('training_queue_enqueue_failed_total', 1, { entity_type: record.entityType });
    return { enqueued: false, code: 'ENQUEUE_FAILED' };
  }
}

/** Fire-and-forget variant for request paths. */
export function enqueueTrainingRecordBestEffort(record: Parameters<typeof enqueueTrainingRecord>[0], reason: string) {
  void enqueueTrainingRecord(record, reason).catch(() => undefined);
}

/**
 * Re-sends records that never reached the queue, and records whose message was
 * accepted long ago but never processed (a lost or expired message). Ineligible
 * and revoked records are never re-sent.
 */
export async function sweepTrainingOutbox(options: { limit?: number; staleQueuedMs?: number; now?: Date; sqs?: SqsClient; queueUrl?: string | null } = {}) {
  const now = options.now ?? new Date();
  const limit = Math.min(Math.max(options.limit ?? 200, 1), 1000);
  const staleBefore = new Date(now.getTime() - (options.staleQueuedMs ?? 6 * 60 * 60 * 1000));
  const candidates = await TrainingDataRecord.find({
    'eligibility.status': { $in: ['pending', 'eligible'] },
    $or: [
      { 'pipeline.status': 'captured' },
      { 'pipeline.status': 'queued', 'pipeline.enqueuedAt': { $lt: staleBefore } },
      { 'pipeline.status': 'processing', 'pipeline.leaseExpiresAt': { $lt: now } },
    ],
  })
    .sort({ 'pipeline.enqueuedAt': 1, createdAt: 1 })
    .limit(limit)
    .select('recordId entityType generationId provenance.correlationId pipeline.attempts')
    .lean<Array<{ recordId: string; entityType: TrainingEntityType; generationId?: string | null; provenance?: { correlationId?: string | null }; pipeline?: { attempts?: number } }>>();
  let enqueued = 0;
  let failed = 0;
  for (const record of candidates) {
    const result = await enqueueTrainingRecord({
      recordId: record.recordId,
      entityType: record.entityType,
      generationId: record.generationId ?? null,
      correlationId: record.provenance?.correlationId ?? null,
    }, `sweep-${now.getTime()}`, { sqs: options.sqs, queueUrl: options.queueUrl, now });
    if (result.enqueued) enqueued += 1;
    else failed += 1;
  }
  emitTrainingMetric('training_outbox_swept_total', enqueued, { result: 'enqueued' });
  if (failed) emitTrainingMetric('training_outbox_swept_total', failed, { result: 'failed' });
  return { scanned: candidates.length, enqueued, failed };
}
