import mongoose, { Schema } from 'mongoose';

export interface ITrainingContentFingerprint {
  dedupeKey: string;
  canonicalizationVersion: string;
  dataset: string;
  contentHash: string;
  canonicalRecordId: string;
  duplicateRecordIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<ITrainingContentFingerprint>({
  dedupeKey: { type: String, required: true, unique: true, maxlength: 220 },
  canonicalizationVersion: { type: String, required: true, maxlength: 80 },
  dataset: { type: String, required: true, maxlength: 80, index: true },
  contentHash: { type: String, required: true, minlength: 64, maxlength: 64, index: true },
  canonicalRecordId: { type: String, required: true, maxlength: 160 },
  duplicateRecordIds: { type: [String], default: [] },
}, { timestamps: true, versionKey: false, strict: 'throw' });

schema.index({ dataset: 1, contentHash: 1 }, { unique: true });

export default mongoose.models.TrainingContentFingerprint ||
  mongoose.model<ITrainingContentFingerprint>('TrainingContentFingerprint', schema, 'training_content_fingerprints');
