import { SQSClient } from '@aws-sdk/client-sqs';
import connectToDatabase from '@/lib/mongoose';
import { processGenerationJob } from '@/lib/generation-worker-runtime';

type QueueMessage = {
  version: 1;
  generationId: string;
  workload: 'image' | 'video' | 'web';
  enqueuedAt: string;
};

type SqsMessage = {
  MessageId?: string;
  ReceiptHandle?: string;
  Body?: string;
  Attributes?: Record<string, string>;
};

const region = process.env.AWS_REGION?.trim() || 'us-east-2';
const queueUrl = process.env.AWS_SQS_IMAGE_QUEUE_URL?.trim();
const workerId = process.env.AWS_ECS_WORKER_ID?.trim()
  || process.env.ECS_CONTAINER_METADATA_URI_V4?.split('/').pop()
  || `ecs-${process.pid}`;
const visibilitySeconds = Math.max(60, Number(process.env.AWS_SQS_VISIBILITY_TIMEOUT_SECONDS ?? 300));
const heartbeatSeconds = Math.max(15, Math.min(
  Math.floor(visibilitySeconds / 2),
  Number(process.env.AWS_SQS_VISIBILITY_HEARTBEAT_SECONDS ?? 120),
));

if (!queueUrl) throw new Error('AWS_SQS_IMAGE_QUEUE_URL is required');

const sqs = new SQSClient({ region });
let stopping = false;
let inFlight = 0;

function log(event: string, fields: Record<string, unknown> = {}) {
  process.stdout.write(JSON.stringify({
    timestamp: new Date().toISOString(),
    service: 'prompt-studio-generation-worker',
    workerId,
    event,
    ...fields,
  }) + '\n');
}

function parseMessage(message: SqsMessage): QueueMessage {
  if (!message.Body) throw new Error('SQS message body is empty');
  const value = JSON.parse(message.Body) as Partial<QueueMessage>;
  if (
    value.version !== 1
    || typeof value.generationId !== 'string'
    || value.generationId.trim().length === 0
    || !['image', 'video', 'web'].includes(String(value.workload))
    || typeof value.enqueuedAt !== 'string'
  ) {
    throw new Error('Invalid SQS generation message');
  }
  return value as QueueMessage;
}

function heartbeat(receiptHandle: string) {
  return setInterval(() => {
    void sqs.changeMessageVisibility({
      QueueUrl: queueUrl,
      ReceiptHandle: receiptHandle,
      VisibilityTimeout: visibilitySeconds,
    }).then(() => log('visibility_extended'))
      .catch((error: unknown) => log('visibility_extension_failed', {
        error: error instanceof Error ? error.name : 'unknown',
      }));
  }, heartbeatSeconds * 1000);
}

async function processMessage(message: SqsMessage) {
  if (!message.ReceiptHandle) throw new Error('SQS receipt handle is missing');
  const body = parseMessage(message);
  const correlationId = message.MessageId || body.generationId;
  inFlight += 1;
  log('message_received', {
    correlationId,
    generationId: body.generationId,
    workload: body.workload,
    receiveCount: message.Attributes?.ApproximateReceiveCount,
  });

  const timer = heartbeat(message.ReceiptHandle);
  try {
    const result = await processGenerationJob(undefined, Math.ceil(visibilitySeconds / 60), body.generationId, {
      routeName: 'aws-sqs-generation-worker',
      owner: `ecs:${workerId}`,
    });

    if (!result) {
      log('job_not_claimed', { correlationId, generationId: body.generationId });
      return;
    }

    if (result.status === 'completed' || result.status === 'dead_letter' || result.status === 'failed') {
      await sqs.deleteMessage({
        QueueUrl: queueUrl,
        ReceiptHandle: message.ReceiptHandle,
      });
      log('message_deleted', {
        correlationId,
        generationId: body.generationId,
        status: result.status,
      });
      return;
    }

    log('message_retained', {
      correlationId,
      generationId: body.generationId,
      status: result.status,
    });
  } finally {
    clearInterval(timer);
    inFlight -= 1;
  }
}

async function poll() {
  await connectToDatabase();
  log('worker_started', { region, queue: queueUrl.split('/').pop() });

  while (!stopping) {
    try {
      const response = await sqs.receiveMessage({
        QueueUrl: queueUrl,
        MaxNumberOfMessages: 1,
        WaitTimeSeconds: 20,
        VisibilityTimeout: visibilitySeconds,
        AttributeNames: ['ApproximateReceiveCount'],
      });
      for (const message of response.Messages ?? []) {
        await processMessage(message);
      }
    } catch (error) {
      log('poll_failed', {
        error: error instanceof Error ? error.name : 'unknown',
        message: error instanceof Error ? error.message.slice(0, 300) : 'unknown',
      });
      if (!stopping) await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  while (inFlight > 0) await new Promise(resolve => setTimeout(resolve, 250));
  log('worker_stopped');
}

function shutdown(signal: string) {
  if (stopping) return;
  stopping = true;
  log('shutdown_requested', { signal, inFlight });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

void poll().catch((error) => {
  log('worker_fatal', {
    error: error instanceof Error ? error.name : 'unknown',
    message: error instanceof Error ? error.message.slice(0, 300) : 'unknown',
  });
  process.exitCode = 1;
});
