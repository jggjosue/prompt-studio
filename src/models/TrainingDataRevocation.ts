import mongoose, { Schema } from 'mongoose';

export const TRAINING_REVOCATION_SCHEMA_VERSION = 1 as const;
export const TRAINING_REVOCATION_REASONS = ['consent_revoked', 'user_request', 'license_revoked', 'provenance_invalid', 'policy_exclusion'] as const;

const schema = new Schema({
  schemaVersion: { type: Number, required: true, default: TRAINING_REVOCATION_SCHEMA_VERSION, immutable: true },
  revocationId: { type: String, required: true, unique: true, immutable: true },
  reason: { type: String, required: true, enum: TRAINING_REVOCATION_REASONS, immutable: true },
  sourceRecordIds: { type: [String], required: true, immutable: true },
  requestedAt: { type: Date, required: true, immutable: true },
  requestedBy: { type: String, required: true, immutable: true },
  notes: { type: String, default: null, immutable: true },
}, { collection: 'training_data_revocations', timestamps: true, versionKey: false, strict: 'throw' });

schema.index({ sourceRecordIds: 1, requestedAt: -1 });
export const TrainingDataRevocation = mongoose.models.TrainingDataRevocation || mongoose.model('TrainingDataRevocation', schema);
