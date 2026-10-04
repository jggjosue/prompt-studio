import type { GenerationTrainingEventName } from '@/lib/training/event-contract';
import type { StoredTrainingModality } from '@/lib/training/modalities';

/**
 * Schema history:
 * - 1: initial records (event only, eventName inside payload, legacy modalities).
 * - 2: top-level event envelope fields, generation relations and pipeline state.
 *      All v2 fields are optional so v1 documents remain valid and readable.
 */
export const TRAINING_DATA_SCHEMA_VERSION = 2 as const;
export const SUPPORTED_TRAINING_DATA_SCHEMA_VERSIONS = [1, 2] as const;

export const TRAINING_ENTITY_TYPES = [
  'session',
  'request',
  'output',
  'feedback',
  'edit',
  'event',
] as const;

export type TrainingEntityType = (typeof TRAINING_ENTITY_TYPES)[number];
export type TrainingModality = StoredTrainingModality;
export const TRAINING_ELIGIBILITY_STATUSES = ['pending', 'eligible', 'ineligible', 'revoked'] as const;
export type TrainingEligibilityStatus = (typeof TRAINING_ELIGIBILITY_STATUSES)[number];

/**
 * Lifecycle of a record inside the training pipeline. The record doubles as an
 * outbox entry: `captured` records that never reached the queue are re-enqueued
 * by the outbox sweep, so a queue outage never loses data or blocks /generate.
 */
export const TRAINING_PIPELINE_STATUSES = [
  'captured', // written to MongoDB, not yet on the queue
  'queued', // accepted by the queue
  'processing', // leased by a worker
  'processed', // produced at least one processed example
  'skipped', // nothing to produce (behavioural event, ineligible, unsupported)
  'rejected', // sanitization or validation rejected the content
  'duplicate', // identical content already processed
  'failed', // permanent failure, needs operator attention
] as const;
export type TrainingPipelineStatus = (typeof TRAINING_PIPELINE_STATUSES)[number];

export interface TrainingConsentSnapshot {
  training: boolean;
  version: string;
  capturedAt: Date;
  source: 'account' | 'generate' | 'feedback' | 'other';
}

export interface TrainingEligibility {
  status: TrainingEligibilityStatus;
  reasonCodes: string[];
  evaluatedAt: Date | null;
  evaluatorVersion: string | null;
}

export interface TrainingAssetReference {
  provider: 'cloudflare-r2' | 'external';
  bucket: string | null;
  key: string;
  contentType: string | null;
  contentHash: string | null;
  bytes: number | null;
}

export interface TrainingModelSnapshot {
  provider: string;
  model: string | null;
  version: string | null;
}

export interface TrainingProvenance {
  source: 'generate' | 'feedback' | 'editor' | 'worker' | 'import';
  sourceId: string | null;
  parentIds: string[];
  correlationId: string | null;
}

export interface TrainingRelations {
  /** Generation this one was regenerated or edited from. */
  parentGenerationId: string | null;
  /** Root generation of a regenerate/edit chain; groups candidates for preference pairs. */
  familyId: string | null;
}

export interface TrainingPipelineState {
  status: TrainingPipelineStatus;
  enqueuedAt: Date | null;
  attempts: number;
  leaseToken: string | null;
  leaseExpiresAt: Date | null;
  processedAt: Date | null;
  /** Stable error/skip code. Never contains content, keys or secrets. */
  lastCode: string | null;
  /** R2 keys of processed examples produced from this record. */
  processedKeys: string[];
}

export interface TrainingDataEnvelope<T extends Record<string, unknown> = Record<string, unknown>> {
  schemaVersion: (typeof SUPPORTED_TRAINING_DATA_SCHEMA_VERSIONS)[number];
  entityType: TrainingEntityType;
  recordId: string;
  userId: string;
  sessionId: string | null;
  requestId: string | null;
  outputId: string | null;
  modality: TrainingModality | null;
  model: TrainingModelSnapshot | null;
  parameters: Record<string, unknown>;
  consent: TrainingConsentSnapshot;
  eligibility: TrainingEligibility;
  provenance: TrainingProvenance;
  assets: TrainingAssetReference[];
  payload: T;
  occurredAt: Date;
  createdAt: Date;
  updatedAt: Date;
  // v2 fields (absent on v1 documents).
  eventName?: GenerationTrainingEventName | null;
  clientEventId?: string | null;
  generationId?: string | null;
  receivedAt?: Date | null;
  appVersion?: string | null;
  relations?: TrainingRelations | null;
  pipeline?: TrainingPipelineState | null;
}

/**
 * Binary assets never belong in MongoDB training records. Persist only R2/external
 * references through TrainingAssetReference. SQS contracts should likewise carry IDs.
 */
export function isTrainingEntityType(value: unknown): value is TrainingEntityType {
  return typeof value === 'string' && (TRAINING_ENTITY_TYPES as readonly string[]).includes(value);
}

/** Reads eventName from either schema version. */
export function trainingRecordEventName(record: { eventName?: unknown; payload?: unknown }): string | null {
  if (typeof record.eventName === 'string') return record.eventName;
  const payload = record.payload as { eventName?: unknown } | undefined;
  return typeof payload?.eventName === 'string' ? payload.eventName : null;
}
