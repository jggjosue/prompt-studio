import assert from 'node:assert/strict';
import test from 'node:test';

test('AWS worker Dockerfile uses the dedicated worker command and non-root runtime', async () => {
  const source = await import('node:fs/promises').then(fs => fs.readFile('Dockerfile.aws-worker', 'utf8'));
  assert.match(source, /CMD \["npm", "run", "worker:aws"\]/);
  assert.match(source, /USER node/);
  assert.doesNotMatch(source, /AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY/);
});

test('AWS worker runtime long-polls SQS and handles graceful shutdown', async () => {
  const source = await import('node:fs/promises').then(fs => fs.readFile('workers/aws-generation-worker.ts', 'utf8'));
  assert.match(source, /WaitTimeSeconds: 20/);
  assert.match(source, /changeMessageVisibility/);
  assert.match(source, /process\.on\('SIGTERM'/);
  assert.match(source, /deleteMessage/);
  assert.doesNotMatch(source, /input\.prompt|SecretAccessKey/);
});
