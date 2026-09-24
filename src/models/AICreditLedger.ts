import mongoose, { Document, Schema } from 'mongoose';

export interface IAICreditLedger extends Document {
  userId: string;
  jobId?: mongoose.Types.ObjectId | null;
  operation: 'reserve' | 'capture' | 'refund' | 'grant' | 'adjustment' | 'expiration';
  type?: 'SUBSCRIPTION_GRANT' | 'TOPUP_PURCHASE' | 'AI_RESERVATION' | 'AI_USAGE' | 'REFUND' | 'ADJUSTMENT' | 'EXPIRATION';
  amount: number;
  balanceImpact?: number;
  source?: 'subscription' | 'purchased' | 'mixed' | 'system';
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
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const AICreditLedgerSchema = new Schema<IAICreditLedger>({
  userId: { type: String, required: true, index: true },
  jobId: { type: Schema.Types.ObjectId, required: false, ref: 'AIGenerationJob', index: true },
  operation: { type: String, required: true, enum: ['reserve', 'capture', 'refund', 'grant', 'adjustment', 'expiration'] },
  type: { type: String, enum: ['SUBSCRIPTION_GRANT', 'TOPUP_PURCHASE', 'AI_RESERVATION', 'AI_USAGE', 'REFUND', 'ADJUSTMENT', 'EXPIRATION'], index: true },
  amount: { type: Number, required: true, min: 0 },
  balanceImpact: { type: Number, default: 0 },
  source: { type: String, enum: ['subscription', 'purchased', 'mixed', 'system'], default: 'system' },
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
  metadata: { type: Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now, index: true },
}, { versionKey: false });

AICreditLedgerSchema.index({ jobId: 1, operation: 1 }, { unique: true });

export default mongoose.models.AICreditLedger || mongoose.model<IAICreditLedger>('AICreditLedger', AICreditLedgerSchema, 'ai_credit_ledger');
