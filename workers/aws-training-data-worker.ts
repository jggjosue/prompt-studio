/**
 * Training-data worker (long-running consumer of the training SQS queue).
 *
 *   npm run worker:training
 *
 * Runs on ECS/Fargate (task-role credentials) or any host with AWS_* env vars.
 * Required: MONGODB_URI, AWS_TRAINING_SQS_QUEUE_URL, TRAINING_PSEUDONYM_SECRET,
 * CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_R2_TRAINING_BUCKET, R2_TRAINING_ACCESS_KEY_ID,
 * R2_TRAINING_SECRET_ACCESS_KEY, plus read access to the media bucket
 * (CLOUDFLARE_R2_BUCKET_NAME, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY).
 * Optional: AWS_TRAINING_SQS_DLQ_URL (depth metrics), AWS_REGION.
 * See docs/training/WORKER.md.
 */
import { SqsClient, regionFromQueueUrl } from '@/lib/aws/sqs-client';
import connectToDatabase from '@/lib/mongoose';
import { mediaAssetSource } from '@/lib/training/media-source';
import { trainingObjectStore } from '@/lib/training/object-store';
import { trainingPseudonymSecret } from '@/lib/training/pseudonym';
import { handleTrainingQueueMessage, reportQueueDepth } from '@/lib/training/worker';

const queueUrl = process.env.AWS_TRAINING_SQS_QUEUE_URL?.trim();
if (!queueUrl) throw new Error('AWS_TRAINING_SQS_QUEUE_URL is required');
const dlqUrl = process.env.AWS_TRAINING_SQS_DLQ_URL?.trim() || null;
const visibilityTimeoutSeconds = 300;
const sqs = new SqsClient({ region: process.env.AWS_REGION?.trim() || regionFromQueueUrl(queueUrl) });
let stopping = false;

async function main() {
  // Fail fast on configuration before taking any message.
  const deps = { store: trainingObjectStore(), media: mediaAssetSource(), pseudonymSecret: trainingPseudonymSecret() };
  await connectToDatabase();
  let lastDepthReport = 0;
  while (!stopping) {
    try {
      if (Date.now() - lastDepthReport > 60_000) {
        lastDepthReport = Date.now();
        await reportQueueDepth(sqs, queueUrl!, dlqUrl).catch(() => undefined);
      }
      const messages = await sqs.receiveMessages(queueUrl!, { maxMessages: 5, waitSeconds: 20, visibilityTimeout: visibilityTimeoutSeconds });
      for (const message of messages) {
        if (stopping) break;
        await handleTrainingQueueMessage({ message, queueUrl: queueUrl!, sqs, deps, visibilityTimeoutSeconds });
      }
    } catch (error) {
      console.error('[training-worker] receive loop error', { error: error instanceof Error ? error.name : 'unknown', message: error instanceof Error ? error.message.slice(0, 120) : null });
      if (!stopping) await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}

process.on('SIGTERM', () => { stopping = true; });
process.on('SIGINT', () => { stopping = true; });
void main().catch((error) => {
  console.error('[training-worker] fatal', { error: error instanceof Error ? error.message.slice(0, 160) : 'unknown' });
  process.exitCode = 1;
});
