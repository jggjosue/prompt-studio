import mongoose, { Document, Schema } from 'mongoose';

export type AIJobKind = 'image' | 'video' | 'project' | 'vision' | 'text' | 'videoUnderstanding';
export type AIJobStatus = 'queued' | 'processing' | 'retrying' | 'completed' | 'failed';

export interface IAIGenerationJob extends Document {
  userId: string;
  userEmail: string;
  kind: AIJobKind;
  provider: string;
  modelId?: string | null;
  operation?: string | null;
  promptVersionId?: string | null;
  promptVersionNumber?: number | null;
  projectId?: string | null;
  outputContractId?: string | null;
  outputValidation?: { status:'valid'|'repaired'|'invalid'; errors:string[]; repaired:boolean } | null;
  input: Record<string, unknown>;
  result?: Record<string, unknown> | null;
  status: AIJobStatus;
  progress: number;
  progressMessage: string;
  idempotencyKey: string;
  creditCost: number;
  creditsCharged?: number | null;
  reservedSubscriptionCredits?: number;
  reservedPurchasedCredits?: number;
  estimatedCostUsd: number;
  estimatedInputTokens?: number | null;
  estimatedOutputTokens?: number | null;
  actualInputTokens?: number | null;
  actualOutputTokens?: number | null;
  actualCostUsd?: number | null;
  actualDurationMs?: number | null;
  outputResolution?: string | null;
  outputQuality?: string | null;
  creditsState: 'reserved' | 'captured' | 'refunded';
  attempts: number;
  maxAttempts: number;
  nextAttemptAt: Date;
  leaseExpiresAt?: Date | null;
  lastError?: string | null;
  feedbackUseful: boolean | null;
  notifyOnComplete: boolean;
  notificationSentAt?: Date | null;
  createdAt: Date;
  startedAt?: Date | null;
  completedAt?: Date | null;
  updatedAt: Date;
}

const AIGenerationJobSchema = new Schema<IAIGenerationJob>({
  userId: { type: String, required: true, index: true },
  userEmail: { type: String, required: true },
  kind: { type: String, required: true, enum: ['image', 'video', 'project', 'vision', 'text', 'videoUnderstanding'], index: true },
  provider: { type: String, required: true },
  modelId: { type: String, default: null, maxlength: 120, index: true },
  operation: { type: String, default: null, maxlength: 80 },
  promptVersionId: { type: String, default: null, index: true },
  promptVersionNumber: { type: Number, default: null, min: 1 },
  projectId: { type: String, default: null, index: true },
  outputContractId: { type: String, default: null, index: true },
  outputValidation: { type: new Schema({ status:{type:String,enum:['valid','repaired','invalid'],required:true},errors:{type:[String],default:[]},repaired:{type:Boolean,default:false} },{_id:false}), default:null },
  input: { type: Schema.Types.Mixed, required: true },
  result: { type: Schema.Types.Mixed, default: null },
  status: { type: String, required: true, enum: ['queued', 'processing', 'retrying', 'completed', 'failed'], default: 'queued', index: true },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  progressMessage: { type: String, default: 'Esperando procesamiento' },
  idempotencyKey: { type: String, required: true },
  creditCost: { type: Number, required: true, min: 0 },
  creditsCharged: { type: Number, default: null, min: 0 },
  reservedSubscriptionCredits: { type: Number, default: 0, min: 0 },
  reservedPurchasedCredits: { type: Number, default: 0, min: 0 },
  estimatedCostUsd: { type: Number, required: true, min: 0 },
  estimatedInputTokens: { type: Number, default: null, min: 0 },
  estimatedOutputTokens: { type: Number, default: null, min: 0 },
  actualInputTokens: { type: Number, default: null, min: 0 },
  actualOutputTokens: { type: Number, default: null, min: 0 },
  actualCostUsd: { type: Number, default: null, min: 0 },
  actualDurationMs: { type: Number, default: null, min: 0 },
  outputResolution: { type: String, default: null, maxlength: 80 },
  outputQuality: { type: String, default: null, maxlength: 80 },
  creditsState: { type: String, enum: ['reserved', 'captured', 'refunded'], default: 'reserved' },
  attempts: { type: Number, default: 0 },
  maxAttempts: { type: Number, default: 3, min: 1, max: 5 },
  nextAttemptAt: { type: Date, default: Date.now, index: true },
  leaseExpiresAt: { type: Date, default: null, index: true },
  lastError: { type: String, default: null },
  /**
   * Copia del veredicto humano (`AIGenerationFeedback`). Permite filtrar y
   * agregar sin cruzar colecciones. `null` = todavía sin valorar.
   */
  feedbackUseful: { type: Boolean, default: null },
  notifyOnComplete: { type: Boolean, default: true },
  notificationSentAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now, index: true },
  startedAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  updatedAt: { type: Date, default: Date.now },
}, { versionKey: false });

AIGenerationJobSchema.index({ userId: 1, idempotencyKey: 1 }, { unique: true });
AIGenerationJobSchema.index({ status: 1, nextAttemptAt: 1, leaseExpiresAt: 1 });

export default mongoose.models.AIGenerationJob || mongoose.model<IAIGenerationJob>('AIGenerationJob', AIGenerationJobSchema, 'ai_generation_jobs');
