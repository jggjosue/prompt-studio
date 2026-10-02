import assert from 'node:assert/strict';
import test from 'node:test';
import {
  assertTrainingSqsMessageIsCompact,
  createTrainingSqsMessage,
  parseTrainingSqsMessage,
} from '../../src/lib/training-sqs-contract';

test('process-record message contains identifiers only', () => {
  const message = createTrainingSqsMessage({
    action: 'process-record',
    idempotencyKey: 'training:event:event-123:v1',
    recordId: 'event-123',
    entityType: 'event',
    generationId: 'generation-456',
    eventId: 'event-123',
    now: new Date('2026-10-02T00:00:00Z'),
  });
  assert.equal(message.version, 1);
  assert.ok(Buffer.byteLength(assertTrainingSqsMessageIsCompact(message)) < 4096);
  assert.equal('prompt' in message, false);
  assert.equal('output' in message, false);
});

test('build messages require buildId', () => {
  assert.throws(() => createTrainingSqsMessage({
    action: 'build-dataset',
    idempotencyKey: 'training:build:1',
  }), /TRAINING_SQS_BUILD_REQUIRED/);
});

test('parser rejects unknown payload fields such as prompt/content', () => {
  assert.throws(() => parseTrainingSqsMessage({
    version: 1,
    action: 'process-record',
    idempotencyKey: 'training:event:event-1:v1',
    recordId: 'event-1',
    entityType: 'event',
    enqueuedAt: '2026-10-02T00:00:00Z',
    prompt: 'must never enter SQS',
  }), /TRAINING_SQS_FORBIDDEN_PAYLOAD/);
});
