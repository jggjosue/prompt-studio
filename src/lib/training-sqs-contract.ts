export const TRAINING_SQS_MESSAGE_VERSION = 1 as const;
export const TRAINING_SQS_ACTIONS = ['process-record', 'build-dataset'] as const;
export type TrainingSqsAction = (typeof TRAINING_SQS_ACTIONS)[number];

export type TrainingSqsMessage = {
  version: typeof TRAINING_SQS_MESSAGE_VERSION;
  action: TrainingSqsAction;
  idempotencyKey: string;
  enqueuedAt: string;
  recordId?: string;
  entityType?: 'session' | 'request' | 'output' | 'feedback' | 'edit' | 'event';
  generationId?: string;
  eventId?: string;
  buildId?: string;
};

const SAFE_ID = /^[A-Za-z0-9:_-]{1,160}$/;

export function createTrainingSqsMessage(input: Omit<TrainingSqsMessage, 'version' | 'enqueuedAt'> & { now?: Date }): TrainingSqsMessage {
  for (const [name, value] of Object.entries(input)) {
    if (name === 'now' || value === undefined) continue;
    if (typeof value === 'string' && name !== 'action' && !SAFE_ID.test(value)) throw new Error(`INVALID_TRAINING_SQS_ID:${name}`);
  }
  if (!TRAINING_SQS_ACTIONS.includes(input.action)) throw new Error('INVALID_TRAINING_SQS_ACTION');
  if (input.action === 'process-record' && (!input.recordId || !input.entityType)) throw new Error('TRAINING_SQS_RECORD_REQUIRED');
  if (input.action === 'build-dataset' && !input.buildId) throw new Error('TRAINING_SQS_BUILD_REQUIRED');

  const message: TrainingSqsMessage = {
    version: TRAINING_SQS_MESSAGE_VERSION,
    action: input.action,
    idempotencyKey: input.idempotencyKey,
    enqueuedAt: (input.now ?? new Date()).toISOString(),
  };
  for (const key of ['recordId', 'entityType', 'generationId', 'eventId', 'buildId'] as const) {
    const value = input[key];
    if (value) Object.assign(message, { [key]: value });
  }
  assertTrainingSqsMessageIsCompact(message);
  return message;
}

export function assertTrainingSqsMessageIsCompact(message: TrainingSqsMessage) {
  const body = JSON.stringify(message);
  const forbidden = ['prompt', 'content', 'input', 'output', 'asset', 'base64', 'secret', 'token'];
  const keys = Object.keys(message).map((key) => key.toLowerCase());
  if (forbidden.some((word) => keys.some((key) => key.includes(word)))) throw new Error('TRAINING_SQS_FORBIDDEN_PAYLOAD');
  if (Buffer.byteLength(body, 'utf8') > 4096) throw new Error('TRAINING_SQS_MESSAGE_TOO_LARGE');
  return body;
}

export function parseTrainingSqsMessage(value: unknown): TrainingSqsMessage {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('INVALID_TRAINING_SQS_MESSAGE');
  const candidate = value as Record<string, unknown>;
  if (candidate.version !== TRAINING_SQS_MESSAGE_VERSION) throw new Error('UNSUPPORTED_TRAINING_SQS_VERSION');
  const allowed = new Set(['version', 'action', 'idempotencyKey', 'enqueuedAt', 'recordId', 'entityType', 'generationId', 'eventId', 'buildId']);
  if (Object.keys(candidate).some((key) => !allowed.has(key))) throw new Error('TRAINING_SQS_FORBIDDEN_PAYLOAD');
  return createTrainingSqsMessage({
    action: candidate.action as TrainingSqsAction,
    idempotencyKey: String(candidate.idempotencyKey ?? ''),
    recordId: candidate.recordId as string | undefined,
    entityType: candidate.entityType as TrainingSqsMessage['entityType'],
    generationId: candidate.generationId as string | undefined,
    eventId: candidate.eventId as string | undefined,
    buildId: candidate.buildId as string | undefined,
    now: new Date(String(candidate.enqueuedAt)),
  });
}
