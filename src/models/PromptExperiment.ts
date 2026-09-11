import mongoose, { Document, Schema } from 'mongoose';

export interface IPromptExperiment extends Document {
  userId: string;
  title: string;
  promptA: string;
  promptB: string;
  providers: string[];
  runs: Array<{ key: string; promptLabel: 'A'|'B'; provider: string; jobId: mongoose.Types.ObjectId }>;
  preferredRunKey: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const PromptExperimentSchema = new Schema<IPromptExperiment>({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true, maxlength: 160 },
  promptA: { type: String, required: true, maxlength: 20_000 },
  promptB: { type: String, required: true, maxlength: 20_000 },
  providers: { type: [String], required: true },
  runs: [{ key: { type: String, required: true }, promptLabel: { type: String, enum: ['A', 'B'], required: true }, provider: { type: String, required: true }, jobId: { type: Schema.Types.ObjectId, ref: 'AIGenerationJob', required: true } }],
  preferredRunKey: { type: String, default: null },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now },
}, { versionKey: false });

PromptExperimentSchema.index({ userId: 1, createdAt: -1 });
export default mongoose.models.PromptExperiment || mongoose.model<IPromptExperiment>('PromptExperiment', PromptExperimentSchema, 'prompt_experiments');

