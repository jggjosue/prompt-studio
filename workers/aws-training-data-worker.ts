import { createHash, createHmac } from 'node:crypto';
import connectToDatabase from '@/lib/mongoose';
import TrainingDataRecord from '@/models/TrainingDataRecord';
import { parseTrainingSqsMessage } from '@/lib/training-sqs-contract';
import { createTrainingR2Client, getTrainingR2Config } from '@/lib/training-r2';
import { verifyReferencedR2Assets, writeProcessedTrainingRecord } from '@/lib/training-preprocessing';

type SqsMessage = { MessageId?: string; ReceiptHandle?: string; Body?: string; Attributes?: Record<string, string> };
type AwsCredentials = { AccessKeyId: string; SecretAccessKey: string; Token?: string };

const region = process.env.AWS_REGION?.trim() || 'us-east-2';
const queueUrl = process.env.AWS_TRAINING_SQS_QUEUE_URL?.trim();
if (!queueUrl) throw new Error('AWS_TRAINING_SQS_QUEUE_URL is required');
let stopping = false;

const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');
const hmac = (key: Buffer | string, value: string) => createHmac('sha256', key).update(value).digest();

async function credentials(): Promise<AwsCredentials> {
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) return {
    AccessKeyId: process.env.AWS_ACCESS_KEY_ID,
    SecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    Token: process.env.AWS_SESSION_TOKEN,
  };
  const relative = process.env.AWS_CONTAINER_CREDENTIALS_RELATIVE_URI;
  const full = process.env.AWS_CONTAINER_CREDENTIALS_FULL_URI;
  const url = full || (relative ? `http://169.254.170.2${relative}` : '');
  if (!url) throw new Error('ECS task credentials are unavailable');
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Unable to obtain ECS task credentials: ${response.status}`);
  return response.json() as Promise<AwsCredentials>;
}

async function sqs<T>(action: string, input: Record<string, unknown>): Promise<T> {
  const creds = await credentials();
  const endpoint = new URL(queueUrl!);
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const date = amzDate.slice(0, 8);
  const body = JSON.stringify(input);
  const headers: Record<string, string> = {
    'content-type': 'application/x-amz-json-1.0',
    host: endpoint.host,
    'x-amz-date': amzDate,
    'x-amz-target': `AmazonSQS.${action}`,
  };
  if (creds.Token) headers['x-amz-security-token'] = creds.Token;
  const names = Object.keys(headers).sort();
  const canonicalHeaders = names.map((name) => `${name}:${headers[name].trim()}\n`).join('');
  const signedHeaders = names.join(';');
  const request = ['POST', endpoint.pathname, '', canonicalHeaders, signedHeaders, sha256(body)].join('\n');
  const scope = `${date}/${region}/sqs/aws4_request`;
  const toSign = ['AWS4-HMAC-SHA256', amzDate, scope, sha256(request)].join('\n');
  const signingKey = hmac(hmac(hmac(hmac(`AWS4${creds.SecretAccessKey}`, date), region), 'sqs'), 'aws4_request');
  headers.authorization = `AWS4-HMAC-SHA256 Credential=${creds.AccessKeyId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${createHmac('sha256', signingKey).update(toSign).digest('hex')}`;
  const response = await fetch(endpoint, { method: 'POST', headers, body });
  if (!response.ok) throw new Error(`SQS_${action}_FAILED:${response.status}`);
  return response.json() as Promise<T>;
}

async function processMessage(message: SqsMessage) {
  if (!message.Body || !message.ReceiptHandle) throw new Error('INVALID_SQS_ENVELOPE');
  const contract = parseTrainingSqsMessage(JSON.parse(message.Body));
  if (contract.action !== 'process-record' || !contract.recordId || !contract.entityType) {
    throw new Error('UNSUPPORTED_TRAINING_WORKER_ACTION');
  }
  const record = await TrainingDataRecord.findOne({ recordId: contract.recordId, entityType: contract.entityType });
  if (!record) throw new Error('TRAINING_RECORD_NOT_FOUND');
  if (!record.consent?.training || !['pending', 'eligible'].includes(record.eligibility?.status)) {
    await sqs('DeleteMessage', { QueueUrl: queueUrl, ReceiptHandle: message.ReceiptHandle });
    return;
  }
  const config = getTrainingR2Config();
  const client = createTrainingR2Client(config);
  await verifyReferencedR2Assets({ client, assets: (record.assets ?? []).map((a: any) => a.toObject ? a.toObject() : a) });
  await writeProcessedTrainingRecord({ client, bucket: config.bucket, record });
  await sqs('DeleteMessage', { QueueUrl: queueUrl, ReceiptHandle: message.ReceiptHandle });
}

async function poll() {
  await connectToDatabase();
  while (!stopping) {
    try {
      const response = await sqs<{ Messages?: SqsMessage[] }>('ReceiveMessage', {
        QueueUrl: queueUrl,
        MaxNumberOfMessages: 1,
        WaitTimeSeconds: 20,
        VisibilityTimeout: 120,
        AttributeNames: ['ApproximateReceiveCount'],
      });
      for (const message of response.Messages ?? []) await processMessage(message);
    } catch (error) {
      process.stderr.write(`[training-worker] ${error instanceof Error ? error.message : 'unknown'}\n`);
      if (!stopping) await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}
process.on('SIGTERM', () => { stopping = true; });
process.on('SIGINT', () => { stopping = true; });
void poll().catch((error) => { process.stderr.write(String(error)); process.exitCode = 1; });
