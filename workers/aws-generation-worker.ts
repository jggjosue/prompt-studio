import { createHash, createHmac } from 'node:crypto';
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

type AwsCredentials = {
  AccessKeyId: string;
  SecretAccessKey: string;
  Token?: string;
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

function sha256(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

function hmac(key: Buffer | string, value: string) {
  return createHmac('sha256', key).update(value).digest();
}

async function getAwsCredentials(): Promise<AwsCredentials> {
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    return {
      AccessKeyId: process.env.AWS_ACCESS_KEY_ID,
      SecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      Token: process.env.AWS_SESSION_TOKEN,
    };
  }

  const relative = process.env.AWS_CONTAINER_CREDENTIALS_RELATIVE_URI;
  const full = process.env.AWS_CONTAINER_CREDENTIALS_FULL_URI;
  const credentialUrl = full || (relative ? `http://169.254.170.2${relative}` : '');

  if (!credentialUrl) {
    throw new Error('ECS task credentials are unavailable');
  }

  const response = await fetch(credentialUrl);
  if (!response.ok) throw new Error(`Unable to obtain ECS task credentials: ${response.status}`);
  return response.json() as Promise<AwsCredentials>;
}

async function sqsRequest<T>(action: string, input: Record<string, unknown>): Promise<T> {
  const credentials = await getAwsCredentials();
  const endpoint = new URL(queueUrl);
  const host = endpoint.host;
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);
  const body = JSON.stringify(input);
  const target = `AmazonSQS.${action}`;
  const contentType = 'application/x-amz-json-1.0';

  const headers: Record<string, string> = {
    'content-type': contentType,
    host,
    'x-amz-date': amzDate,
    'x-amz-target': target,
  };
  if (credentials.Token) headers['x-amz-security-token'] = credentials.Token;

  const signedHeaderNames = Object.keys(headers).sort();
  const canonicalHeaders = signedHeaderNames.map(name => `${name}:${headers[name].trim()}\n`).join('');
  const signedHeaders = signedHeaderNames.join(';');
  const canonicalRequest = [
    'POST',
    endpoint.pathname,
    '',
    canonicalHeaders,
    signedHeaders,
    sha256(body),
  ].join('\n');

  const scope = `${dateStamp}/${region}/sqs/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    scope,
    sha256(canonicalRequest),
  ].join('\n');

  const dateKey = hmac(`AWS4${credentials.SecretAccessKey}`, dateStamp);
  const regionKey = hmac(dateKey, region);
  const serviceKey = hmac(regionKey, 'sqs');
  const signingKey = hmac(serviceKey, 'aws4_request');
  const signature = createHmac('sha256', signingKey).update(stringToSign).digest('hex');

  headers.authorization =
    `AWS4-HMAC-SHA256 Credential=${credentials.AccessKeyId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body,
  });

  if (!response.ok) {
    const errorBody = (await response.text()).slice(0, 500);
    throw new Error(`SQS ${action} failed (${response.status}): ${errorBody}`);
  }

  return response.json() as Promise<T>;
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
    void sqsRequest('ChangeMessageVisibility', {
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
      await sqsRequest('DeleteMessage', {
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
      const response = await sqsRequest<{ Messages?: SqsMessage[] }>('ReceiveMessage', {
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
