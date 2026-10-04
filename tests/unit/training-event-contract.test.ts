import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CLIENT_TRAINING_EVENTS,
  GENERATION_TRAINING_EVENTS,
  SERVER_TRAINING_EVENTS,
  TrainingEventValidationError,
  parseClientTrainingEvent,
} from '../../src/lib/training/event-contract';

const now = new Date('2026-10-03T12:00:00Z');

function event(overrides: Record<string, unknown> = {}) {
  return {
    schemaVersion: 2,
    clientEventId: '3f2c7a1e-9b4d-4c2a-8e6f-1a2b3c4d5e6f',
    eventName: 'output_downloaded',
    occurredAt: '2026-10-03T11:59:58Z',
    sessionId: 'chat_123',
    generationId: '6650c0ffee0000000000aaaa',
    modality: 'image',
    appVersion: '1.4.0',
    payload: { format: 'png', surface: 'generate', outputIndex: 0 },
    ...overrides,
  };
}

function code(fn: () => unknown) {
  try {
    fn();
  } catch (error) {
    assert.ok(error instanceof TrainingEventValidationError);
    return error.code;
  }
  assert.fail('expected a validation error');
}

test('the taxonomy has the 12 required events split between server and client', () => {
  assert.deepEqual([...GENERATION_TRAINING_EVENTS].sort(), [
    'added_to_queue', 'feedback_negative', 'feedback_positive', 'generation_completed', 'generation_failed',
    'generation_started', 'output_downloaded', 'output_saved', 'output_viewed', 'prompt_edited',
    'prompt_submitted', 'regenerate_clicked',
  ]);
  assert.equal(SERVER_TRAINING_EVENTS.length + CLIENT_TRAINING_EVENTS.length, GENERATION_TRAINING_EVENTS.length);
  assert.ok(!GENERATION_TRAINING_EVENTS.some((name) => /key|typ|stroke|input_changed/.test(name)), 'no keystroke-level events');
});

test('accepts a well-formed client event and normalizes occurredAt', () => {
  const parsed = parseClientTrainingEvent(event(), now);
  assert.equal(parsed.eventName, 'output_downloaded');
  assert.equal(parsed.occurredAt, '2026-10-03T11:59:58.000Z');
  assert.deepEqual(parsed.payload, { format: 'png', surface: 'generate', outputIndex: 0 });
});

test('clients cannot emit server lifecycle events', () => {
  assert.equal(code(() => parseClientTrainingEvent(event({ eventName: 'generation_completed' }), now)), 'EVENT_NOT_ALLOWED_FROM_CLIENT');
  assert.equal(code(() => parseClientTrainingEvent(event({ eventName: 'prompt_submitted' }), now)), 'EVENT_NOT_ALLOWED_FROM_CLIENT');
});

test('prompt text, keystrokes and unknown fields are rejected anywhere in the event', () => {
  assert.equal(code(() => parseClientTrainingEvent(event({ prompt: 'secret plan' }), now)), 'FIELD_NOT_ALLOWED:prompt');
  assert.equal(code(() => parseClientTrainingEvent(event({ payload: { prompt: 'hi' } }), now)), 'PAYLOAD_FIELD_NOT_ALLOWED:prompt');
  assert.equal(code(() => parseClientTrainingEvent(event({ payload: { keystrokes: 'a,b,c' } }), now)), 'PAYLOAD_FIELD_NOT_ALLOWED:keystrokes');
  assert.equal(code(() => parseClientTrainingEvent(event({ payload: { format: 'exe' } }), now)), 'INVALID_PAYLOAD_VALUE:format');
  assert.equal(code(() => parseClientTrainingEvent(event({ userId: 'someone-else' }), now)), 'FIELD_NOT_ALLOWED:userId');
  assert.equal(code(() => parseClientTrainingEvent(event({ provider: 'spoofed' }), now)), 'FIELD_NOT_ALLOWED:provider');
});

test('validation errors never echo the rejected value', () => {
  const secret = 'sk-live-THIS-MUST-NOT-LEAK-1234567890';
  try {
    parseClientTrainingEvent(event({ payload: { format: secret } }), now);
  } catch (error) {
    assert.ok(!(error as Error).message.includes(secret));
  }
});

test('idempotency and identifiers are validated', () => {
  assert.equal(code(() => parseClientTrainingEvent(event({ clientEventId: 'x' }), now)), 'INVALID_CLIENT_EVENT_ID');
  assert.equal(code(() => parseClientTrainingEvent(event({ generationId: 'has spaces' }), now)), 'INVALID_GENERATIONID');
  assert.equal(code(() => parseClientTrainingEvent(event({ generationId: undefined }), now)), 'GENERATION_ID_REQUIRED');
  assert.equal(code(() => parseClientTrainingEvent(event({ eventName: 'prompt_edited', payload: {} }), now)), 'PARENT_GENERATION_ID_REQUIRED');
  assert.equal(code(() => parseClientTrainingEvent(event({ schemaVersion: 1 }), now)), 'UNSUPPORTED_SCHEMA_VERSION');
});

test('occurredAt must be a plausible client clock reading', () => {
  assert.equal(code(() => parseClientTrainingEvent(event({ occurredAt: 'yesterday' }), now)), 'INVALID_OCCURRED_AT');
  assert.equal(code(() => parseClientTrainingEvent(event({ occurredAt: '2026-10-03T13:00:00Z' }), now)), 'OCCURRED_AT_OUT_OF_RANGE');
  assert.equal(code(() => parseClientTrainingEvent(event({ occurredAt: '2026-09-01T00:00:00Z' }), now)), 'OCCURRED_AT_OUT_OF_RANGE');
});

test('regenerate and edit events carry the parent generation', () => {
  const parsed = parseClientTrainingEvent(event({ eventName: 'regenerate_clicked', parentGenerationId: 'parent_1', payload: {} }), now);
  assert.equal(parsed.parentGenerationId, 'parent_1');
});
