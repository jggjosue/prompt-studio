import assert from 'node:assert/strict';
import test from 'node:test';
import {
  TRAINING_SQS_MAX_BYTES,
  TrainingSqsContractError,
  assertTrainingSqsMessageIsCompact,
  createTrainingSqsMessage,
  parseTrainingSqsMessage,
} from '../../src/lib/training-sqs-contract';

const now = new Date('2026-10-02T00:00:00Z');

test('process-record message carries identifiers only (v2 with correlationId)', () => {
  const message = createTrainingSqsMessage({
    recordId: 'out:6650c0ffee',
    entityType: 'output',
    correlationId: 'corr-1',
    idempotencyKey: 'out:6650c0ffee:s1',
    generationId: '6650c0ffee',
    now,
  });
  assert.equal(message.schemaVersion, 2);
  assert.equal(message.action, 'process-record');
  assert.equal(message.correlationId, 'corr-1');
  const body = assertTrainingSqsMessageIsCompact(message);
  assert.ok(Buffer.byteLength(body) < TRAINING_SQS_MAX_BYTES);
  assert.deepEqual(Object.keys(JSON.parse(body)).sort(), ['action', 'correlationId', 'enqueuedAt', 'entityType', 'generationId', 'idempotencyKey', 'recordId', 'schemaVersion']);
});

test('ids must be safe identifiers, never free text', () => {
  assert.throws(() => createTrainingSqsMessage({ recordId: 'a prompt with spaces', entityType: 'event', idempotencyKey: 'k', now }), /INVALID_TRAINING_SQS_ID:recordId/);
  assert.throws(() => createTrainingSqsMessage({ recordId: 'x'.repeat(161), entityType: 'event', idempotencyKey: 'k', now }), /INVALID_TRAINING_SQS_ID/);
  assert.throws(() => createTrainingSqsMessage({ recordId: 'r1', entityType: 'blob' as never, idempotencyKey: 'k', now }), /ENTITY_TYPE/);
});

test('parser rejects content fields such as prompt, base64 or urls', () => {
  for (const extra of [{ prompt: 'x' }, { imageBase64: 'x' }, { videoUrl: 'x' }, { html: 'x' }]) {
    assert.throws(() => parseTrainingSqsMessage({
      schemaVersion: 2, action: 'process-record', recordId: 'r1', entityType: 'event', correlationId: null,
      idempotencyKey: 'r1:1', enqueuedAt: now.toISOString(), ...extra,
    }), /TRAINING_SQS_FORBIDDEN_PAYLOAD/);
  }
});

test('parser upgrades v1 messages and keeps rejecting their forbidden fields', () => {
  const upgraded = parseTrainingSqsMessage({
    version: 1, action: 'process-record', idempotencyKey: 'training:event:e1:v1', recordId: 'e1', entityType: 'event', enqueuedAt: now.toISOString(),
  });
  assert.equal(upgraded.schemaVersion, 2);
  assert.equal(upgraded.correlationId, null);
  assert.throws(() => parseTrainingSqsMessage({
    version: 1, action: 'process-record', idempotencyKey: 'k', recordId: 'e1', entityType: 'event', enqueuedAt: now.toISOString(), prompt: 'no',
  }), /FORBIDDEN_PAYLOAD/);
});

test('contract errors are permanent so the worker acknowledges instead of retrying', () => {
  for (const body of [null, [], { schemaVersion: 9 }, { version: 1, action: 'build-dataset', idempotencyKey: 'k', buildId: 'b', enqueuedAt: now.toISOString() }]) {
    try {
      parseTrainingSqsMessage(body);
      assert.fail('expected a contract error');
    } catch (error) {
      assert.ok(error instanceof TrainingSqsContractError);
      assert.equal(error.permanent, true);
    }
  }
});
