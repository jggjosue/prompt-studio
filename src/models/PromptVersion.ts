import mongoose, { Document, Schema } from 'mongoose';

export type PromptVersionAction = 'saved' | 'duplicated' | 'restored';

export interface IPromptVersion extends Document {
  userId: string;
  promptId: string;
  promptKind: 'image' | 'video' | 'web';
  version: number;
  title: string;
  content: string;
  note: string;
  action: PromptVersionAction;
  basedOnVersion: number | null;
  modelSnapshot: string[];
  createdAt: Date;
}

const PromptVersionSchema = new Schema<IPromptVersion>({
  userId: { type: String, required: true, index: true },
  promptId: { type: String, required: true },
  promptKind: { type: String, required: true, enum: ['image', 'video', 'web'] },
  version: { type: Number, required: true, min: 1 },
  title: { type: String, required: true },
  content: { type: String, required: true, maxlength: 20_000 },
  note: { type: String, default: '', maxlength: 300 },
  action: { type: String, required: true, enum: ['saved', 'duplicated', 'restored'] },
  basedOnVersion: { type: Number, default: null },
  modelSnapshot: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now, index: true },
}, { versionKey: false });

PromptVersionSchema.index({ userId: 1, promptId: 1, version: 1 }, { unique: true });
PromptVersionSchema.index({ userId: 1, promptId: 1, createdAt: -1 });

export default mongoose.models.PromptVersion || mongoose.model<IPromptVersion>('PromptVersion', PromptVersionSchema, 'prompt_versions');

