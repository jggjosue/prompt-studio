import { randomUUID } from 'node:crypto';
import {
  GENERATION_JOB_STATES,
  type GenerationJobErrorCategory,
  type PersistedGenerationJobState,
} from '@/lib/generation-job-state';
import mongoose, { Document, Schema } from 'mongoose';

export type AIJobKind = 'image' | 'video' | 'project' | 'vision' | 'text' | 'videoUnderstanding';
export type AIJobStatus = 'queued' | 'processing' | 'retrying' | 'uploading' | 'finalizing' | 'completed' | 'failed' | 'dead_letter' | 'cancelled';

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
  correlationId: string;
  providerRequestId?: string | null;
  assetRef?: string | null;
  outputRef?: string | null;
  errorCategory?: GenerationJobErrorCategory | null;
  retryable?: boolean | null;
  failureMetadata?: { category: GenerationJobErrorCategory; code?: string | null; httpStatus?: number | null; retryable: boolean; attempt: number; occurredAt: Date } | null;
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
  lockOwner?: string | null;
  lockToken?: string | null;
  lockAcquiredAt?: Date | null;
  lastError?: string | null;
  feedbackUseful: boolean | null;
  notifyOnComplete: boolean;
  notificationSentAt?: Date | null;
  createdAt: Date;
  startedAt?: Date | null;
  uploadingAt?: Date | null;
  finalizingAt?: Date | null;
  completedAt?: Date | null;
  deadLetterAt?: Date | null;
  reprocessedAt?: Date | null;
  reprocessedJobId?: string | null;
  reprocessReason?: string | null;
  cancelledAt?: Date | null;
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
  outputValidation: { type: new Schema({ status:{type:String,enum:['valid','repaired','invalid'],required:true},errors:{type:[String],default:[]},repaired:{type:Boolean,default:false} },{_id:false, suppressReservedKeysWarning: true}), default:null },
  input: { type: Schema.Types.Mixed, required: true },
  result: { type: Schema.Types.Mixed, default: null },
  status: { type: String, required: true, enum: [...GENERATION_JOB_STATES, 'retrying'], default: 'queued', index: true },
  correlationId: { type: String, required: true, default: () => randomUUID(), maxlength: 120, index: true },
  providerRequestId: { type: String, default: null, maxlength: 200 },
  assetRef: { type: String, default: null, maxlength: 500 },
  outputRef: { type: String, default: null, maxlength: 500 },
  errorCategory: { type: String, default: null, enum: ['bad_request', 'auth_or_permission', 'model_not_found', 'rate_limit_or_quota', 'timeout', 'provider_error', 'provider_unavailable', 'storage_error', 'validation_error', 'configuration_error', 'cancelled', 'unknown'] },
  retryable: { type: Boolean, default: null },
  failureMetadata: { type: new Schema({ category: { type: String, required: true }, code: { type: String, default: null, maxlength: 100 }, httpStatus: { type: Number, default: null }, retryable: { type: Boolean, required: true }, attempt: { type: Number, required: true, min: 0 }, occurredAt: { type: Date, required: true } }, { _id: false }), default: null },
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
  lockOwner: { type: String, default: null, maxlength: 200 },
  lockToken: { type: String, default: null, maxlength: 120, index: true },
  lockAcquiredAt: { type: Date, default: null },
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
  uploadingAt: { type: Date, default: null },
  finalizingAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  deadLetterAt: { type: Date, default: null, index: true },
  reprocessedAt: { type: Date, default: null },
  reprocessedJobId: { type: String, default: null, maxlength: 80 },
  reprocessReason: { type: String, default: null, maxlength: 500 },
  cancelledAt: { type: Date, default: null },
  updatedAt: { type: Date, default: Date.now },
}, { versionKey: false, suppressReservedKeysWarning: true });

AIGenerationJobSchema.index({ userId: 1, idempotencyKey: 1 }, { unique: true });
AIGenerationJobSchema.index({ status: 1, nextAttemptAt: 1, leaseExpiresAt: 1 });

export default mongoose.models.AIGenerationJob || mongoose.model<IAIGenerationJob>('AIGenerationJob', AIGenerationJobSchema, 'ai_generation_jobs');
