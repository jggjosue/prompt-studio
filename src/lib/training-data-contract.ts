export const TRAINING_DATA_SCHEMA_VERSION = 1 as const;

export const TRAINING_ENTITY_TYPES = [
  'session',
  'request',
  'output',
  'feedback',
  'edit',
  'event',
] as const;

export type TrainingEntityType = (typeof TRAINING_ENTITY_TYPES)[number];
export type TrainingModality = 'image' | 'video' | 'web' | 'text' | 'vision' | 'project';
export type TrainingEligibilityStatus = 'pending' | 'eligible' | 'ineligible' | 'revoked';

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

export interface TrainingDataEnvelope<T extends Record<string, unknown> = Record<string, unknown>> {
  schemaVersion: typeof TRAINING_DATA_SCHEMA_VERSION;
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
}

/**
 * Binary assets never belong in MongoDB training records. Persist only R2/external
 * references through TrainingAssetReference. SQS contracts should likewise carry IDs.
 */
export function isTrainingEntityType(value: unknown): value is TrainingEntityType {
  return typeof value === 'string' && (TRAINING_ENTITY_TYPES as readonly string[]).includes(value);
}
