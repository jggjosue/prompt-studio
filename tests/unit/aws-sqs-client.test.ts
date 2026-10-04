import assert from 'node:assert/strict';
import test from 'node:test';
import { SqsClient, SqsRequestError, regionFromQueueUrl, signAwsRequest } from '../../src/lib/aws/sqs-client';

// AWS Signature Version 4 test suite (aws-sig-v4-test-suite), shared inputs.
const suiteCredentials = { accessKeyId: 'AKIDEXAMPLE', secretAccessKey: 'wJalrXUtnFEMI/K7MDENG+bPxRfiCYEXAMPLEKEY' };
const suiteDate = new Date('2015-08-30T12:36:00Z');

test('SigV4 matches the AWS test suite (get-vanilla)', async () => {
  const headers = await signAwsRequest({
    method: 'GET', url: new URL('https://example.amazonaws.com/'), service: 'service', region: 'us-east-1',
    credentials: suiteCredentials, date: suiteDate, body: '',
  });
  assert.equal(
    headers.authorization,
    'AWS4-HMAC-SHA256 Credential=AKIDEXAMPLE/20150830/us-east-1/service/aws4_request, SignedHeaders=host;x-amz-date, Signature=5fa00fa31553b73ebf1942676e86291e8372ff2a2260956d9b8aae1d763fbf31',
  );
});

test('SigV4 matches the AWS test suite (post-vanilla)', async () => {
  const headers = await signAwsRequest({
    method: 'POST', url: new URL('https://example.amazonaws.com/'), service: 'service', region: 'us-east-1',
    credentials: suiteCredentials, date: suiteDate, body: '',
  });
  assert.match(headers.authorization, /Signature=5da7c1a2acd57cee7505fc6676e4e544621c30862966e37dddb68e92efbe5d6b$/);
});

test('session tokens are signed', async () => {
  const headers = await signAwsRequest({
    method: 'POST', url: new URL('https://sqs.us-east-2.amazonaws.com/1/q'), service: 'sqs', region: 'us-east-2',
    credentials: { ...suiteCredentials, sessionToken: 'session' }, date: suiteDate, body: '{}',
  });
  assert.equal(headers['x-amz-security-token'], 'session');
  assert.match(headers.authorization, /SignedHeaders=host;x-amz-date;x-amz-security-token,/);
});

test('sendMessage posts the JSON protocol request to the queue URL', async () => {
  const calls: Array<{ url: string; init: RequestInit }> = [];
  const client = new SqsClient({
    region: 'us-east-2',
    credentials: async () => suiteCredentials,
    now: () => suiteDate,
    fetch: async (url, init) => {
      calls.push({ url: String(url), init: init! });
      return new Response(JSON.stringify({ MessageId: 'm-1' }), { status: 200 });
    },
  });
  const result = await client.sendMessage('https://sqs.us-east-2.amazonaws.com/123/training', '{"recordId":"r1"}');
  assert.equal(result.MessageId, 'm-1');
  const headers = calls[0].init.headers as Record<string, string>;
  assert.equal(headers['x-amz-target'], 'AmazonSQS.SendMessage');
  assert.equal(headers['content-type'], 'application/x-amz-json-1.0');
  assert.equal(headers.host, undefined, 'fetch sets host');
  assert.deepEqual(JSON.parse(String(calls[0].init.body)), {
    QueueUrl: 'https://sqs.us-east-2.amazonaws.com/123/training', MessageBody: '{"recordId":"r1"}',
  });
});

test('errors expose operation, status and AWS code only, and classify retries', async () => {
  const client = new SqsClient({
    credentials: async () => suiteCredentials,
    fetch: async () => new Response(JSON.stringify({ __type: 'com.amazonaws.sqs#RequestThrottled', message: 'body with secret' }), { status: 400 }),
  });
  await assert.rejects(client.sendMessage('https://sqs.us-east-1.amazonaws.com/1/q', 'payload'), (error: unknown) => {
    assert.ok(error instanceof SqsRequestError);
    assert.equal(error.message, 'SQS_SENDMESSAGE_FAILED:400:RequestThrottled');
    assert.equal(error.retryable, true);
    assert.ok(!error.message.includes('secret'));
    return true;
  });
  assert.equal(new SqsRequestError('SendMessage', 403, 'AccessDenied').retryable, false);
});

test('regionFromQueueUrl reads AWS queue URLs and ignores emulators', () => {
  assert.equal(regionFromQueueUrl('https://sqs.eu-west-1.amazonaws.com/123/q'), 'eu-west-1');
  assert.equal(regionFromQueueUrl('http://localhost:9324/000000000000/q'), null);
});
