import mongoose, { Document, Schema } from 'mongoose';

export interface IAIGenerationChat extends Document {
  userId: string;
  title: string;
  mode: 'image' | 'video' | 'project';
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AIGenerationChatSchema = new Schema<IAIGenerationChat>({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true, default: 'Nueva conversación' },
  mode: { type: String, required: true, enum: ['image', 'video', 'project'], default: 'image' },
  isArchived: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });

AIGenerationChatSchema.index({ userId: 1, updatedAt: -1 });

export default mongoose.models.AIGenerationChat || mongoose.model<IAIGenerationChat>('AIGenerationChat', AIGenerationChatSchema, 'ai_generation_chats');
