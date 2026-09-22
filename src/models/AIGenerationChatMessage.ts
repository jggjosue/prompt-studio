import mongoose, { Document, Schema } from 'mongoose';

export interface IAIGenerationChatMessage extends Document {
  chatId: string;
  role: 'user' | 'assistant' | 'system';
  mode: 'image' | 'video' | 'project';
  prompt: string;
  params: Record<string, unknown>;
  result: Record<string, unknown> | null;
  status: 'pending' | 'completed' | 'failed';
  progress: number;
  createdAt: Date;
}

const AIGenerationChatMessageSchema = new Schema<IAIGenerationChatMessage>({
  chatId: { type: String, required: true, index: true },
  role: { type: String, required: true, enum: ['user', 'assistant', 'system'] },
  mode: { type: String, required: true, enum: ['image', 'video', 'project'] },
  prompt: { type: String, required: true },
  params: { type: Schema.Types.Mixed, default: {} },
  result: { type: Schema.Types.Mixed, default: null },
  status: { type: String, required: true, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  progress: { type: Number, default: 0, min: 0, max: 100 },
}, { timestamps: true, versionKey: false });

AIGenerationChatMessageSchema.index({ chatId: 1, createdAt: 1 });

export default mongoose.models.AIGenerationChatMessage || mongoose.model<IAIGenerationChatMessage>('AIGenerationChatMessage', AIGenerationChatMessageSchema, 'ai_generation_chat_messages');
