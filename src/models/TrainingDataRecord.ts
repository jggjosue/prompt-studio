import mongoose, { Document, Schema } from 'mongoose';
import {
  TRAINING_DATA_SCHEMA_VERSION,
  TRAINING_ELIGIBILITY_STATUSES,
  TRAINING_ENTITY_TYPES,
  TRAINING_PIPELINE_STATUSES,
  type TrainingEligibilityStatus,
  type TrainingEntityType,
  type TrainingModality,
  type TrainingPipelineState,
  type TrainingRelations,
} from '@/lib/training-data-contract';
import { GENERATION_TRAINING_EVENTS, type GenerationTrainingEventName } from '@/lib/training/event-contract';
import { STORED_TRAINING_MODALITIES } from '@/lib/training/modalities';

export interface ITrainingDataRecord extends Document {
  schemaVersion: number;
  entityType: TrainingEntityType;
  recordId: string;
  userId: string;
  sessionId: string | null;
  requestId: string | null;
  outputId: string | null;
  modality: TrainingModality | null;
  model: { provider: string; model: string | null; version: string | null } | null;
  parameters: Record<string, unknown>;
  consent: { training: boolean; version: string; capturedAt: Date; source: string };
  eligibility: { status: TrainingEligibilityStatus; reasonCodes: string[]; evaluatedAt: Date | null; evaluatorVersion: string | null };
  provenance: { source: string; sourceId: string | null; parentIds: string[]; correlationId: string | null };
  assets: Array<{ provider: 'cloudflare-r2' | 'external'; bucket: string | null; key: string; contentType: string | null; contentHash: string | null; bytes: number | null }>;
  payload: Record<string, unknown>;
  occurredAt: Date;
  createdAt: Date;
  updatedAt: Date;
  // schemaVersion 2 (optional so v1 documents stay valid).
  eventName: GenerationTrainingEventName | null;
  clientEventId: string | null;
  generationId: string | null;
  receivedAt: Date | null;
  appVersion: string | null;
  relations: TrainingRelations | null;
  pipeline: TrainingPipelineState | null;
}

const ModelSnapshotSchema = new Schema({
  provider: { type: String, required: true, maxlength: 120 },
  model: { type: String, default: null, maxlength: 160 },
  version: { type: String, default: null, maxlength: 120 },
}, { _id: false });

const ConsentSnapshotSchema = new Schema({
  training: { type: Boolean, required: true },
  version: { type: String, required: true, maxlength: 80 },
  capturedAt: { type: Date, required: true },
  source: { type: String, required: true, enum: ['account', 'generate', 'feedback', 'other'] },
}, { _id: false });

const EligibilitySchema = new Schema({
  status: { type: String, required: true, enum: TRAINING_ELIGIBILITY_STATUSES, default: 'pending' },
  reasonCodes: { type: [String], default: [] },
  evaluatedAt: { type: Date, default: null },
  evaluatorVersion: { type: String, default: null, maxlength: 80 },
}, { _id: false });

const ProvenanceSchema = new Schema({
  source: { type: String, required: true, enum: ['generate', 'feedback', 'editor', 'worker', 'import'] },
  sourceId: { type: String, default: null, maxlength: 160 },
  parentIds: { type: [String], default: [] },
  correlationId: { type: String, default: null, maxlength: 120 },
}, { _id: false });

const AssetReferenceSchema = new Schema({
  provider: { type: String, required: true, enum: ['cloudflare-r2', 'external'] },
  bucket: { type: String, default: null, maxlength: 160 },
  key: { type: String, required: true, maxlength: 1500 },
  contentType: { type: String, default: null, maxlength: 160 },
  contentHash: { type: String, default: null, maxlength: 160 },
  bytes: { type: Number, default: null, min: 0 },
}, { _id: false });

const RelationsSchema = new Schema({
  parentGenerationId: { type: String, default: null, maxlength: 160 },
  familyId: { type: String, default: null, maxlength: 160 },
}, { _id: false });

const PipelineStateSchema = new Schema({
  status: { type: String, required: true, enum: TRAINING_PIPELINE_STATUSES, default: 'captured' },
  enqueuedAt: { type: Date, default: null },
  attempts: { type: Number, default: 0, min: 0 },
  leaseToken: { type: String, default: null, maxlength: 80 },
  leaseExpiresAt: { type: Date, default: null },
  processedAt: { type: Date, default: null },
  lastCode: { type: String, default: null, maxlength: 120 },
  processedKeys: { type: [String], default: [] },
}, { _id: false });

const TrainingDataRecordSchema = new Schema<ITrainingDataRecord>({
  schemaVersion: { type: Number, required: true, default: TRAINING_DATA_SCHEMA_VERSION, min: 1, index: true },
  entityType: { type: String, required: true, enum: TRAINING_ENTITY_TYPES, index: true },
  recordId: { type: String, required: true, maxlength: 160 },
  userId: { type: String, required: true, index: true },
  sessionId: { type: String, default: null, maxlength: 160, index: true },
  requestId: { type: String, default: null, maxlength: 160, index: true },
  outputId: { type: String, default: null, maxlength: 160, index: true },
  modality: { type: String, default: null, enum: [...STORED_TRAINING_MODALITIES, null], index: true },
  model: { type: ModelSnapshotSchema, default: null },
  parameters: { type: Schema.Types.Mixed, default: () => ({}) },
  consent: { type: ConsentSnapshotSchema, required: true },
  eligibility: { type: EligibilitySchema, required: true, default: () => ({ status: 'pending', reasonCodes: [] }) },
  provenance: { type: ProvenanceSchema, required: true },
  assets: { type: [AssetReferenceSchema], default: [] },
  payload: { type: Schema.Types.Mixed, required: true },
  occurredAt: { type: Date, required: true, index: true },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now },
  eventName: { type: String, default: null, enum: [...GENERATION_TRAINING_EVENTS, null] },
  clientEventId: { type: String, default: null, maxlength: 80 },
  generationId: { type: String, default: null, maxlength: 160 },
  receivedAt: { type: Date, default: null },
  appVersion: { type: String, default: null, maxlength: 64 },
  relations: { type: RelationsSchema, default: null },
  pipeline: { type: PipelineStateSchema, default: null },
}, {
  versionKey: false,
  strict: 'throw',
  minimize: false,
  suppressReservedKeysWarning: true,
});

TrainingDataRecordSchema.index({ entityType: 1, recordId: 1 }, { unique: true });
TrainingDataRecordSchema.index({ userId: 1, occurredAt: -1 });
TrainingDataRecordSchema.index({ 'eligibility.status': 1, entityType: 1, occurredAt: 1 });
TrainingDataRecordSchema.index({ requestId: 1, entityType: 1 });
TrainingDataRecordSchema.index({ 'provenance.correlationId': 1, occurredAt: -1 });
// Signals for an output and candidates of a regenerate/edit family.
TrainingDataRecordSchema.index({ generationId: 1, entityType: 1, eventName: 1 });
TrainingDataRecordSchema.index({ 'relations.familyId': 1, entityType: 1 });
// Outbox sweep and lease recovery.
TrainingDataRecordSchema.index({ 'pipeline.status': 1, 'pipeline.enqueuedAt': 1 });
// Consent revocation cascade.
TrainingDataRecordSchema.index({ userId: 1, 'eligibility.status': 1 });

TrainingDataRecordSchema.pre('validate', function enforceTrainingBoundaries() {
  if (this.eligibility?.status === 'eligible' && this.consent?.training !== true) {
    this.invalidate('eligibility.status', 'Training data cannot be eligible without explicit training consent.');
  }
  for (const asset of this.assets ?? []) {
    if (asset.provider === 'cloudflare-r2' && !asset.bucket) {
      this.invalidate('assets', 'Cloudflare R2 asset references require a bucket.');
      break;
    }
  }
});

export default mongoose.models.TrainingDataRecord ||
  mongoose.model<ITrainingDataRecord>('TrainingDataRecord', TrainingDataRecordSchema, 'training_data_records');
