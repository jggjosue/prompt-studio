import mongoose, { Document, Schema } from 'mongoose';
import {
  TRAINING_DATA_SCHEMA_VERSION,
  TRAINING_ENTITY_TYPES,
  type TrainingEligibilityStatus,
  type TrainingEntityType,
  type TrainingModality,
} from '@/lib/training-data-contract';

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
  status: { type: String, required: true, enum: ['pending', 'eligible', 'ineligible', 'revoked'], default: 'pending' },
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

const TrainingDataRecordSchema = new Schema<ITrainingDataRecord>({
  schemaVersion: { type: Number, required: true, default: TRAINING_DATA_SCHEMA_VERSION, min: 1, index: true },
  entityType: { type: String, required: true, enum: TRAINING_ENTITY_TYPES, index: true },
  recordId: { type: String, required: true, maxlength: 160 },
  userId: { type: String, required: true, index: true },
  sessionId: { type: String, default: null, maxlength: 160, index: true },
  requestId: { type: String, default: null, maxlength: 160, index: true },
  outputId: { type: String, default: null, maxlength: 160, index: true },
  modality: { type: String, default: null, enum: ['image', 'video', 'web', 'text', 'vision', 'project'], index: true },
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
