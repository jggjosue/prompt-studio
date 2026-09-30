import mongoose, { Document, Schema } from 'mongoose';

export const AI_CREDIT_LEDGER_SOURCES = ['subscription', 'purchased', 'founder', 'promotional', 'mixed', 'system'] as const;
export type AICreditLedgerSource = typeof AI_CREDIT_LEDGER_SOURCES[number];

export interface IAICreditLedger extends Document {
  userId: string;
  jobId?: mongoose.Types.ObjectId | null;
  allocationId?: mongoose.Types.ObjectId | null;
  operation: 'reserve' | 'capture' | 'refund' | 'grant' | 'adjustment' | 'expiration';
  type?: 'SUBSCRIPTION_GRANT' | 'TOPUP_PURCHASE' | 'FOUNDER_GRANT' | 'PROMOTIONAL_GRANT' | 'AI_RESERVATION' | 'AI_USAGE' | 'REFUND' | 'ADJUSTMENT' | 'EXPIRATION';
  amount: number;
  balanceImpact?: number;
  balanceBefore?: number | null;
  balanceAfter?: number | null;
  source?: AICreditLedgerSource;
  provider?: string | null;
  modelId?: string | null;
  operationName?: string | null;
  inputTokens?: number | null;
  outputTokens?: number | null;
  estimatedApiCostUsd?: number | null;
  actualApiCostUsd?: number | null;
  creditsCharged?: number | null;
  requestId?: string | null;
  stripePaymentId?: string | null;
  expiresAt?: Date | null;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const AICreditLedgerSchema = new Schema<IAICreditLedger>({
  userId: { type: String, required: true, index: true },
  jobId: { type: Schema.Types.ObjectId, required: false, ref: 'AIGenerationJob', index: true },
  allocationId: { type: Schema.Types.ObjectId, required: false, ref: 'AICreditAllocation', index: true },
  operation: { type: String, required: true, enum: ['reserve', 'capture', 'refund', 'grant', 'adjustment', 'expiration'] },
  type: { type: String, enum: ['SUBSCRIPTION_GRANT', 'TOPUP_PURCHASE', 'FOUNDER_GRANT', 'PROMOTIONAL_GRANT', 'AI_RESERVATION', 'AI_USAGE', 'REFUND', 'ADJUSTMENT', 'EXPIRATION'], index: true },
  amount: { type: Number, required: true, min: 0 },
  balanceImpact: { type: Number, default: 0 },
  balanceBefore: { type: Number, default: null, min: 0 },
  balanceAfter: { type: Number, default: null, min: 0 },
  source: { type: String, enum: AI_CREDIT_LEDGER_SOURCES, default: 'system', index: true },
  provider: { type: String, default: null },
  modelId: { type: String, default: null },
  operationName: { type: String, default: null },
  inputTokens: { type: Number, default: null, min: 0 },
  outputTokens: { type: Number, default: null, min: 0 },
  estimatedApiCostUsd: { type: Number, default: null, min: 0 },
  actualApiCostUsd: { type: Number, default: null, min: 0 },
  creditsCharged: { type: Number, default: null, min: 0 },
  requestId: { type: String, default: null, index: true },
  stripePaymentId: { type: String, default: null, index: true },
  expiresAt: { type: Date, default: null, index: true },
  metadata: { type: Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now, index: true },
}, { versionKey: false });

AICreditLedgerSchema.index(
  { jobId: 1, operation: 1 },
  { unique: true, partialFilterExpression: { jobId: { $type: 'objectId' } } },
);
AICreditLedgerSchema.index(
  { requestId: 1 },
  { unique: true, partialFilterExpression: { requestId: { $type: 'string' } } },
);
AICreditLedgerSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.AICreditLedger || mongoose.model<IAICreditLedger>('AICreditLedger', AICreditLedgerSchema, 'ai_credit_ledger');
