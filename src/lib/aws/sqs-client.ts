/**
 * Minimal Amazon SQS client (JSON protocol, SigV4) built on fetch and WebCrypto.
 *
 * Why not @aws-sdk/client-sqs: the producer runs inside the web app, which is
 * deployed to edge runtimes where the AWS SDK's Node dependencies are a poor
 * fit, and the workers already avoid the SDK. Only the five operations the
 * training pipeline needs are implemented.
 *
 * The client never logs request bodies. Errors carry the operation and HTTP
 * status only, so message contents cannot leak through error reporting.
 */

export type AwsCredentials = { accessKeyId: string; secretAccessKey: string; sessionToken?: string };
export type CredentialsProvider = () => Promise<AwsCredentials>;
type FetchLike = (input: string | URL, init?: RequestInit) => Promise<Response>;

export type SqsReceivedMessage = {
  MessageId: string;
  ReceiptHandle: string;
  Body: string;
  Attributes?: Record<string, string>;
};

export class SqsRequestError extends Error {
  constructor(public readonly operation: string, public readonly status: number, public readonly awsCode: string | null) {
    super(`SQS_${operation.toUpperCase()}_FAILED:${status}${awsCode ? `:${awsCode}` : ''}`);
    this.name = 'SqsRequestError';
  }

  /** Throttling and server errors are worth retrying; 4xx contract errors are not. */
  get retryable() {
    return this.status >= 500 || this.status === 429 || /Throttl|RequestThrottled|OverLimit/i.test(this.awsCode ?? '');
  }
}

const encoder = new TextEncoder();

function toHex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function sha256Hex(value: string) {
  return toHex(await crypto.subtle.digest('SHA-256', encoder.encode(value)));
}

async function hmac(key: ArrayBuffer | Uint8Array, value: string) {
  const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(value));
}

/**
 * AWS Signature Version 4 for a request with no query string. Returns the
 * headers to send (host is omitted because fetch sets it).
 */
export async function signAwsRequest(input: {
  method: string;
  url: URL;
  service: string;
  region: string;
  credentials: AwsCredentials;
  date: Date;
  body: string;
  headers?: Record<string, string>;
}): Promise<Record<string, string>> {
  const amzDate = input.date.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const day = amzDate.slice(0, 8);
  const headers: Record<string, string> = {};
  for (const [name, value] of Object.entries(input.headers ?? {})) headers[name.toLowerCase()] = value;
  headers.host = input.url.host;
  headers['x-amz-date'] = amzDate;
  if (input.credentials.sessionToken) headers['x-amz-security-token'] = input.credentials.sessionToken;
  const names = Object.keys(headers).sort();
  const canonicalHeaders = names.map((name) => `${name}:${headers[name].trim()}\n`).join('');
  const signedHeaders = names.join(';');
  const canonicalRequest = [input.method, input.url.pathname || '/', '', canonicalHeaders, signedHeaders, await sha256Hex(input.body)].join('\n');
  const scope = `${day}/${input.region}/${input.service}/aws4_request`;
  const stringToSign = ['AWS4-HMAC-SHA256', amzDate, scope, await sha256Hex(canonicalRequest)].join('\n');
  let key: ArrayBuffer = await hmac(encoder.encode(`AWS4${input.credentials.secretAccessKey}`), day);
  for (const part of [input.region, input.service, 'aws4_request']) key = await hmac(key, part);
  const signature = toHex(await hmac(key, stringToSign));
  headers.authorization = `AWS4-HMAC-SHA256 Credential=${input.credentials.accessKeyId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  return headers;
}

/** Region from a queue URL such as https://sqs.us-east-2.amazonaws.com/123/queue. */
export function regionFromQueueUrl(queueUrl: string): string | null {
  const match = /^sqs\.([a-z0-9-]+)\.amazonaws\.com$/.exec(new URL(queueUrl).host);
  return match?.[1] ?? null;
}

/** Static credentials from the environment, or ECS task-role credentials. */
export function defaultAwsCredentials(env: Record<string, string | undefined> = process.env, fetchImpl: FetchLike = fetch): CredentialsProvider {
  let cached: { value: AwsCredentials; expiresAt: number } | null = null;
  return async () => {
    const accessKeyId = env.AWS_ACCESS_KEY_ID?.trim();
    const secretAccessKey = env.AWS_SECRET_ACCESS_KEY?.trim();
    if (accessKeyId && secretAccessKey) return { accessKeyId, secretAccessKey, sessionToken: env.AWS_SESSION_TOKEN?.trim() || undefined };
    if (cached && cached.expiresAt - Date.now() > 60_000) return cached.value;
    const relative = env.AWS_CONTAINER_CREDENTIALS_RELATIVE_URI;
    const url = env.AWS_CONTAINER_CREDENTIALS_FULL_URI || (relative ? `http://169.254.170.2${relative}` : '');
    if (!url) throw new Error('AWS_CREDENTIALS_UNAVAILABLE');
    const response = await fetchImpl(url);
    if (!response.ok) throw new Error(`AWS_CONTAINER_CREDENTIALS_FAILED:${response.status}`);
    const body = await response.json() as { AccessKeyId: string; SecretAccessKey: string; Token?: string; Expiration?: string };
    const value = { accessKeyId: body.AccessKeyId, secretAccessKey: body.SecretAccessKey, sessionToken: body.Token };
    cached = { value, expiresAt: body.Expiration ? Date.parse(body.Expiration) : Date.now() + 5 * 60_000 };
    return value;
  };
}

export class SqsClient {
  private readonly region: string;
  private readonly fetchImpl: FetchLike;
  private readonly credentials: CredentialsProvider;
  private readonly now: () => Date;

  constructor(options: {
    region?: string | null;
    credentials?: CredentialsProvider;
    fetch?: FetchLike;
    now?: () => Date;
  } = {}) {
    this.region = options.region?.trim() || process.env.AWS_REGION?.trim() || 'us-east-1';
    this.fetchImpl = options.fetch ?? fetch;
    this.credentials = options.credentials ?? defaultAwsCredentials();
    this.now = options.now ?? (() => new Date());
  }

  private async call<T>(queueUrl: string, operation: string, input: Record<string, unknown>): Promise<T> {
    const credentials = await this.credentials();
    const endpoint = new URL(queueUrl);
    const body = JSON.stringify(input);
    const headers = await signAwsRequest({
      method: 'POST',
      url: endpoint,
      service: 'sqs',
      region: this.region,
      credentials,
      date: this.now(),
      body,
      headers: { 'content-type': 'application/x-amz-json-1.0', 'x-amz-target': `AmazonSQS.${operation}` },
    });
    delete headers.host;
    const response = await this.fetchImpl(endpoint, { method: 'POST', headers, body });
    if (!response.ok) {
      const error = await response.json().catch(() => null) as { __type?: string } | null;
      const awsCode = typeof error?.__type === 'string' ? error.__type.split('#').pop()?.slice(0, 80) ?? null : null;
      throw new SqsRequestError(operation, response.status, awsCode);
    }
    const text = await response.text();
    return (text ? JSON.parse(text) : {}) as T;
  }

  sendMessage(queueUrl: string, body: string, options: { delaySeconds?: number } = {}) {
    return this.call<{ MessageId: string }>(queueUrl, 'SendMessage', {
      QueueUrl: queueUrl,
      MessageBody: body,
      ...(options.delaySeconds ? { DelaySeconds: options.delaySeconds } : {}),
    });
  }

  async receiveMessages(queueUrl: string, options: { maxMessages?: number; waitSeconds?: number; visibilityTimeout?: number } = {}) {
    const result = await this.call<{ Messages?: SqsReceivedMessage[] }>(queueUrl, 'ReceiveMessage', {
      QueueUrl: queueUrl,
      MaxNumberOfMessages: options.maxMessages ?? 5,
      WaitTimeSeconds: options.waitSeconds ?? 20,
      ...(options.visibilityTimeout ? { VisibilityTimeout: options.visibilityTimeout } : {}),
      MessageSystemAttributeNames: ['ApproximateReceiveCount', 'SentTimestamp'],
    });
    return result.Messages ?? [];
  }

  deleteMessage(queueUrl: string, receiptHandle: string) {
    return this.call<Record<string, never>>(queueUrl, 'DeleteMessage', { QueueUrl: queueUrl, ReceiptHandle: receiptHandle });
  }

  changeMessageVisibility(queueUrl: string, receiptHandle: string, visibilityTimeout: number) {
    return this.call<Record<string, never>>(queueUrl, 'ChangeMessageVisibility', {
      QueueUrl: queueUrl, ReceiptHandle: receiptHandle, VisibilityTimeout: visibilityTimeout,
    });
  }

  async queueDepth(queueUrl: string) {
    const result = await this.call<{ Attributes?: Record<string, string> }>(queueUrl, 'GetQueueAttributes', {
      QueueUrl: queueUrl,
      AttributeNames: ['ApproximateNumberOfMessages', 'ApproximateNumberOfMessagesNotVisible', 'ApproximateNumberOfMessagesDelayed'],
    });
    const attributes = result.Attributes ?? {};
    return {
      visible: Number(attributes.ApproximateNumberOfMessages ?? 0),
      inFlight: Number(attributes.ApproximateNumberOfMessagesNotVisible ?? 0),
      delayed: Number(attributes.ApproximateNumberOfMessagesDelayed ?? 0),
    };
  }
}
