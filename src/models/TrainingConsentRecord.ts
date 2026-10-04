import mongoose, { Document, Schema } from 'mongoose';

export const TRAINING_CONSENT_POLICY_VERSION = '2026-10-v1';
/** 1: initial shape. Records written before this field existed are treated as 1. */
export const TRAINING_CONSENT_RECORD_SCHEMA_VERSION = 1 as const;

export interface ITrainingConsentRecord extends Document {
  schemaVersion: number;
  userId: string;
  training: boolean;
  policyVersion: string;
  source: 'settings' | 'generate' | 'feedback' | 'admin';
  changedAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const TrainingConsentRecordSchema = new Schema<ITrainingConsentRecord>({
  schemaVersion: { type: Number, required: true, default: TRAINING_CONSENT_RECORD_SCHEMA_VERSION, min: 1, immutable: true },
  userId: { type: String, required: true, index: true },
  training: { type: Boolean, required: true, default: false },
  policyVersion: { type: String, required: true, maxlength: 80 },
  source: { type: String, required: true, enum: ['settings', 'generate', 'feedback', 'admin'] },
  changedAt: { type: Date, required: true, default: Date.now },
  revokedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { versionKey: false, strict: 'throw' });

TrainingConsentRecordSchema.index({ userId: 1, changedAt: -1 });
TrainingConsentRecordSchema.index({ userId: 1, policyVersion: 1, changedAt: -1 });

export default mongoose.models.TrainingConsentRecord ||
  mongoose.model<ITrainingConsentRecord>('TrainingConsentRecord', TrainingConsentRecordSchema, 'training_consent_records');
