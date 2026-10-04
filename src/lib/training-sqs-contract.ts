import { isTrainingEntityType, type TrainingEntityType } from '@/lib/training-data-contract';

/**
 * Amazon SQS message contract for the training-data queue.
 *
 * Messages carry identifiers only. The worker loads everything else from
 * MongoDB (and from R2 for assets) after re-checking consent, so a message can
 * be replayed, redriven from the DLQ or delivered twice without ever exposing
 * content in transit or in queue tooling.
 *
 * Versions:
 * - 1: `{ version: 1, action, idempotencyKey, enqueuedAt, recordId, entityType, ... }`
 *      Still accepted by the parser and upgraded to v2 (correlationId null).
 * - 2: adds `schemaVersion` and `correlationId`; `build-dataset` is no longer
 *      produced (releases run as a CLI, not through the queue).
 */
export const TRAINING_SQS_SCHEMA_VERSION = 2 as const;
/** @deprecated kept for callers of the v1 constant; equals the current schema version. */
export const TRAINING_SQS_MESSAGE_VERSION = TRAINING_SQS_SCHEMA_VERSION;
export const TRAINING_SQS_ACTIONS = ['process-record'] as const;
export type TrainingSqsAction = (typeof TRAINING_SQS_ACTIONS)[number];
export const TRAINING_SQS_MAX_BYTES = 4096;

export type TrainingSqsMessage = {
  schemaVersion: typeof TRAINING_SQS_SCHEMA_VERSION;
  action: TrainingSqsAction;
  recordId: string;
  entityType: TrainingEntityType;
  correlationId: string | null;
  idempotencyKey: string;
  enqueuedAt: string;
  generationId?: string;
};

/**
 * Contract violations are permanent: retrying a malformed message can never
 * succeed, so the worker acknowledges it with a reason code instead of letting
 * it cycle until the DLQ.
 */
export class TrainingSqsContractError extends Error {
  readonly permanent = true;
  constructor(public readonly code: string) {
    super(code);
    this.name = 'TrainingSqsContractError';
  }
}

const SAFE_ID = /^[A-Za-z0-9:_-]{1,160}$/;
const FORBIDDEN_KEY_PARTS = ['prompt', 'content', 'input', 'output', 'asset', 'base64', 'secret', 'token', 'text', 'html', 'url'];

function safeId(value: unknown, field: string, required: boolean): string | undefined {
  if (value === undefined || value === null || value === '') {
    if (required) throw new TrainingSqsContractError(`TRAINING_SQS_FIELD_REQUIRED:${field}`);
    return undefined;
  }
  if (typeof value !== 'string' || !SAFE_ID.test(value)) throw new TrainingSqsContractError(`INVALID_TRAINING_SQS_ID:${field}`);
  return value;
}

export function createTrainingSqsMessage(input: {
  action?: TrainingSqsAction;
  recordId: string;
  entityType: TrainingEntityType;
  correlationId?: string | null;
  idempotencyKey: string;
  generationId?: string | null;
  now?: Date;
}): TrainingSqsMessage {
  const action = input.action ?? 'process-record';
  if (!TRAINING_SQS_ACTIONS.includes(action)) throw new TrainingSqsContractError('UNSUPPORTED_TRAINING_SQS_ACTION');
  if (!isTrainingEntityType(input.entityType)) throw new TrainingSqsContractError('INVALID_TRAINING_SQS_ENTITY_TYPE');
  const enqueuedAt = input.now ?? new Date();
  if (Number.isNaN(enqueuedAt.getTime())) throw new TrainingSqsContractError('INVALID_TRAINING_SQS_ENQUEUED_AT');
  const message: TrainingSqsMessage = {
    schemaVersion: TRAINING_SQS_SCHEMA_VERSION,
    action,
    recordId: safeId(input.recordId, 'recordId', true)!,
    entityType: input.entityType,
    correlationId: safeId(input.correlationId, 'correlationId', false) ?? null,
    idempotencyKey: safeId(input.idempotencyKey, 'idempotencyKey', true)!,
    enqueuedAt: enqueuedAt.toISOString(),
  };
  const generationId = safeId(input.generationId, 'generationId', false);
  if (generationId) message.generationId = generationId;
  assertTrainingSqsMessageIsCompact(message);
  return message;
}

export function assertTrainingSqsMessageIsCompact(message: TrainingSqsMessage): string {
  const allowedKeys = new Set(['schemaVersion', 'action', 'recordId', 'entityType', 'correlationId', 'idempotencyKey', 'enqueuedAt', 'generationId']);
  for (const key of Object.keys(message)) {
    if (!allowedKeys.has(key)) throw new TrainingSqsContractError('TRAINING_SQS_FORBIDDEN_PAYLOAD');
  }
  const body = JSON.stringify(message);
  if (new TextEncoder().encode(body).byteLength > TRAINING_SQS_MAX_BYTES) throw new TrainingSqsContractError('TRAINING_SQS_MESSAGE_TOO_LARGE');
  return body;
}

/** Parses a v1 or v2 message body (already JSON-decoded). Throws TrainingSqsContractError. */
export function parseTrainingSqsMessage(value: unknown): TrainingSqsMessage {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TrainingSqsContractError('INVALID_TRAINING_SQS_MESSAGE');
  const candidate = value as Record<string, unknown>;
  const v1 = candidate.version === 1 && candidate.schemaVersion === undefined;
  if (!v1 && candidate.schemaVersion !== TRAINING_SQS_SCHEMA_VERSION) throw new TrainingSqsContractError('UNSUPPORTED_TRAINING_SQS_VERSION');
  const allowed = v1
    ? new Set(['version', 'action', 'idempotencyKey', 'enqueuedAt', 'recordId', 'entityType', 'generationId', 'eventId', 'buildId'])
    : new Set(['schemaVersion', 'action', 'recordId', 'entityType', 'correlationId', 'idempotencyKey', 'enqueuedAt', 'generationId']);
  for (const key of Object.keys(candidate)) {
    const lower = key.toLowerCase();
    if (!allowed.has(key) || (key !== 'enqueuedAt' && FORBIDDEN_KEY_PARTS.some((part) => lower.includes(part)))) {
      throw new TrainingSqsContractError('TRAINING_SQS_FORBIDDEN_PAYLOAD');
    }
  }
  if (candidate.action !== 'process-record') throw new TrainingSqsContractError('UNSUPPORTED_TRAINING_SQS_ACTION');
  return createTrainingSqsMessage({
    recordId: candidate.recordId as string,
    entityType: candidate.entityType as TrainingEntityType,
    correlationId: v1 ? null : (candidate.correlationId as string | null | undefined),
    idempotencyKey: candidate.idempotencyKey as string,
    generationId: candidate.generationId as string | undefined,
    now: new Date(String(candidate.enqueuedAt)),
  });
}
