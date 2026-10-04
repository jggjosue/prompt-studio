/**
 * Training event contract (schema v2) shared by the /generate client and the
 * ingestion API. Pure module: no Node or server imports, safe in the browser.
 *
 * Privacy rules enforced here, not by convention:
 * - Events never carry prompt or output text. The submitted prompt lives on the
 *   AIGenerationJob and is read by the dataset worker only after consent is
 *   re-validated. Keystrokes are never recorded: there is no "typing" event and
 *   payloads are limited to a per-event allowlist of small scalar fields.
 * - Provider, model, correlationId and userId are filled by the server from the
 *   job it owns; client-supplied values for them are ignored.
 */
import { isTrainingModality, type TrainingModality } from '@/lib/training/modalities';

export const TRAINING_EVENT_SCHEMA_VERSION = 2 as const;

export const GENERATION_TRAINING_EVENTS = [
  'prompt_submitted',
  'generation_started',
  'generation_completed',
  'generation_failed',
  'output_viewed',
  'output_saved',
  'output_downloaded',
  'regenerate_clicked',
  'prompt_edited',
  'feedback_positive',
  'feedback_negative',
  'added_to_queue',
] as const;
export type GenerationTrainingEventName = (typeof GENERATION_TRAINING_EVENTS)[number];

/** Emitted by the server from the generation lifecycle; clients cannot send them. */
export const SERVER_TRAINING_EVENTS = [
  'prompt_submitted',
  'generation_started',
  'generation_completed',
  'generation_failed',
] as const satisfies readonly GenerationTrainingEventName[];

/** Emitted by the /generate UI through POST /api/ai/training-events. */
export const CLIENT_TRAINING_EVENTS = [
  'output_viewed',
  'output_saved',
  'output_downloaded',
  'regenerate_clicked',
  'prompt_edited',
  'feedback_positive',
  'feedback_negative',
  'added_to_queue',
] as const satisfies readonly GenerationTrainingEventName[];
export type ClientTrainingEventName = (typeof CLIENT_TRAINING_EVENTS)[number];

/** Events that are behavioural evidence about a specific output. */
export const OUTPUT_SIGNAL_EVENTS = [
  'output_viewed',
  'output_saved',
  'output_downloaded',
  'regenerate_clicked',
  'prompt_edited',
  'feedback_positive',
  'feedback_negative',
] as const satisfies readonly GenerationTrainingEventName[];

const SURFACES = ['generate', 'queue', 'history', 'tray'] as const;
const DOWNLOAD_FORMATS = ['png', 'jpg', 'webp', 'gif', 'mp4', 'webm', 'html', 'zip', 'txt', 'other'] as const;
const NEGATIVE_REASONS = ['quality', 'accuracy', 'safety', 'style', 'irrelevant', 'other'] as const;

type PayloadRule =
  | { kind: 'enum'; values: readonly string[] }
  | { kind: 'int'; min: number; max: number };

const COMMON_PAYLOAD: Record<string, PayloadRule> = {
  surface: { kind: 'enum', values: SURFACES },
  outputIndex: { kind: 'int', min: 0, max: 16 },
};

const EVENT_PAYLOAD: Record<ClientTrainingEventName, Record<string, PayloadRule>> = {
  output_viewed: { visibleMs: { kind: 'int', min: 0, max: 3_600_000 } },
  output_saved: {},
  output_downloaded: { format: { kind: 'enum', values: DOWNLOAD_FORMATS } },
  regenerate_clicked: {},
  prompt_edited: {},
  feedback_positive: {},
  feedback_negative: { reason: { kind: 'enum', values: NEGATIVE_REASONS } },
  added_to_queue: { queueLength: { kind: 'int', min: 0, max: 500 } },
};

/** Events that must reference the generation they are about. */
const REQUIRES_GENERATION: ReadonlySet<ClientTrainingEventName> = new Set([
  'output_viewed', 'output_saved', 'output_downloaded', 'regenerate_clicked',
  'feedback_positive', 'feedback_negative',
]);
/**
 * Events that describe a new prompt derived from a previous generation. For
 * regenerate_clicked the new generation does not exist yet when the user
 * clicks; its link to the parent is recorded by the server from the job's
 * trainingContext, so the event only needs the generation being regenerated.
 */
const REQUIRES_PARENT: ReadonlySet<ClientTrainingEventName> = new Set(['prompt_edited']);

export type TrainingEventPayload = Record<string, string | number>;

/** What the browser sends. */
export interface ClientTrainingEvent {
  schemaVersion: typeof TRAINING_EVENT_SCHEMA_VERSION;
  clientEventId: string;
  eventName: ClientTrainingEventName;
  occurredAt: string;
  sessionId?: string | null;
  generationId?: string | null;
  outputId?: string | null;
  parentGenerationId?: string | null;
  modality?: TrainingModality | null;
  appVersion?: string | null;
  payload?: TrainingEventPayload;
}

/** The full envelope stored for every event, client or server originated. */
export interface TrainingEventEnvelope {
  schemaVersion: typeof TRAINING_EVENT_SCHEMA_VERSION;
  clientEventId: string | null;
  eventName: GenerationTrainingEventName;
  userId: string;
  sessionId: string | null;
  requestId: string | null;
  generationId: string | null;
  outputId: string | null;
  parentGenerationId: string | null;
  correlationId: string | null;
  occurredAt: Date;
  receivedAt: Date;
  modality: TrainingModality | null;
  provider: string | null;
  model: string | null;
  modelVersion: string | null;
  appVersion: string | null;
  payload: TrainingEventPayload;
}

const ID = /^[A-Za-z0-9_-]{1,120}$/;
const CLIENT_EVENT_ID = /^[A-Za-z0-9-]{8,80}$/;
const APP_VERSION = /^[A-Za-z0-9._+-]{1,64}$/;
/** Client clocks drift; accept events up to this far in the past or future. */
const MAX_PAST_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_FUTURE_MS = 5 * 60 * 1000;

export class TrainingEventValidationError extends Error {
  constructor(public readonly code: string) {
    super(code);
    this.name = 'TrainingEventValidationError';
  }
}

function optionalId(value: unknown, field: string): string | null {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string' || !ID.test(value)) throw new TrainingEventValidationError(`INVALID_${field.toUpperCase()}`);
  return value;
}

function parsePayload(eventName: ClientTrainingEventName, value: unknown): TrainingEventPayload {
  if (value === undefined || value === null) return {};
  if (typeof value !== 'object' || Array.isArray(value)) throw new TrainingEventValidationError('INVALID_PAYLOAD');
  const rules = { ...COMMON_PAYLOAD, ...EVENT_PAYLOAD[eventName] };
  const payload: TrainingEventPayload = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    const rule = rules[key];
    if (!rule) throw new TrainingEventValidationError(`PAYLOAD_FIELD_NOT_ALLOWED:${key.slice(0, 40)}`);
    if (rule.kind === 'enum') {
      if (typeof raw !== 'string' || !rule.values.includes(raw)) throw new TrainingEventValidationError(`INVALID_PAYLOAD_VALUE:${key}`);
      payload[key] = raw;
    } else {
      if (typeof raw !== 'number' || !Number.isInteger(raw) || raw < rule.min || raw > rule.max) {
        throw new TrainingEventValidationError(`INVALID_PAYLOAD_VALUE:${key}`);
      }
      payload[key] = raw;
    }
  }
  return payload;
}

/**
 * Validates an event posted by the browser. Throws TrainingEventValidationError
 * with a stable code; never echoes the offending value.
 */
export function parseClientTrainingEvent(value: unknown, now = new Date()): ClientTrainingEvent {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TrainingEventValidationError('INVALID_EVENT');
  const input = value as Record<string, unknown>;
  const allowed = new Set([
    'schemaVersion', 'clientEventId', 'eventName', 'occurredAt', 'sessionId', 'generationId', 'outputId',
    'parentGenerationId', 'modality', 'appVersion', 'payload',
  ]);
  for (const key of Object.keys(input)) {
    if (!allowed.has(key)) throw new TrainingEventValidationError(`FIELD_NOT_ALLOWED:${key.slice(0, 40)}`);
  }
  if (input.schemaVersion !== TRAINING_EVENT_SCHEMA_VERSION) throw new TrainingEventValidationError('UNSUPPORTED_SCHEMA_VERSION');
  if (typeof input.clientEventId !== 'string' || !CLIENT_EVENT_ID.test(input.clientEventId)) {
    throw new TrainingEventValidationError('INVALID_CLIENT_EVENT_ID');
  }
  if (!(CLIENT_TRAINING_EVENTS as readonly string[]).includes(String(input.eventName))) {
    throw new TrainingEventValidationError('EVENT_NOT_ALLOWED_FROM_CLIENT');
  }
  const eventName = input.eventName as ClientTrainingEventName;
  const occurredAt = typeof input.occurredAt === 'string' ? new Date(input.occurredAt) : new Date(Number.NaN);
  if (Number.isNaN(occurredAt.getTime())) throw new TrainingEventValidationError('INVALID_OCCURRED_AT');
  const skew = occurredAt.getTime() - now.getTime();
  if (skew > MAX_FUTURE_MS || -skew > MAX_PAST_MS) throw new TrainingEventValidationError('OCCURRED_AT_OUT_OF_RANGE');
  if (input.modality !== undefined && input.modality !== null && !isTrainingModality(input.modality)) {
    throw new TrainingEventValidationError('INVALID_MODALITY');
  }
  if (input.appVersion !== undefined && input.appVersion !== null && (typeof input.appVersion !== 'string' || !APP_VERSION.test(input.appVersion))) {
    throw new TrainingEventValidationError('INVALID_APP_VERSION');
  }
  const event: ClientTrainingEvent = {
    schemaVersion: TRAINING_EVENT_SCHEMA_VERSION,
    clientEventId: input.clientEventId,
    eventName,
    occurredAt: occurredAt.toISOString(),
    sessionId: optionalId(input.sessionId, 'sessionId'),
    generationId: optionalId(input.generationId, 'generationId'),
    outputId: optionalId(input.outputId, 'outputId'),
    parentGenerationId: optionalId(input.parentGenerationId, 'parentGenerationId'),
    modality: (input.modality as TrainingModality | null | undefined) ?? null,
    appVersion: (input.appVersion as string | null | undefined) ?? null,
    payload: parsePayload(eventName, input.payload),
  };
  if (REQUIRES_GENERATION.has(eventName) && !event.generationId) throw new TrainingEventValidationError('GENERATION_ID_REQUIRED');
  if (REQUIRES_PARENT.has(eventName) && !event.parentGenerationId) throw new TrainingEventValidationError('PARENT_GENERATION_ID_REQUIRED');
  return event;
}

export function isClientTrainingEventName(value: unknown): value is ClientTrainingEventName {
  return typeof value === 'string' && (CLIENT_TRAINING_EVENTS as readonly string[]).includes(value);
}
