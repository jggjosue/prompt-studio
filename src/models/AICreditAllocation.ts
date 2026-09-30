import mongoose, { Document, Schema } from 'mongoose';

export const AI_CREDIT_SOURCES = ['MONTHLY', 'PURCHASED', 'FOUNDER', 'PROMOTIONAL'] as const;
export type AICreditSource = typeof AI_CREDIT_SOURCES[number];

export interface IAICreditAllocation extends Document {
  userId: string;
  source: AICreditSource;
  grantLedgerId?: mongoose.Types.ObjectId | null;
  originalAmount: number;
  availableAmount: number;
  reservedAmount: number;
  expiresAt?: Date | null;
  sourceReference?: string | null;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const AICreditAllocationSchema = new Schema<IAICreditAllocation>({
  userId: { type: String, required: true, index: true },
  source: { type: String, required: true, enum: AI_CREDIT_SOURCES, index: true },
  grantLedgerId: { type: Schema.Types.ObjectId, default: null, ref: 'AICreditLedger', index: true },
  originalAmount: { type: Number, required: true, min: 0 },
  availableAmount: { type: Number, required: true, min: 0 },
  reservedAmount: { type: Number, default: 0, min: 0 },
  expiresAt: { type: Date, default: null, index: true },
  sourceReference: { type: String, default: null, maxlength: 200, index: true },
  metadata: { type: Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now },
}, { versionKey: false });

AICreditAllocationSchema.index({ userId: 1, source: 1, expiresAt: 1, createdAt: 1 });
AICreditAllocationSchema.index(
  { userId: 1, sourceReference: 1 },
  { unique: true, partialFilterExpression: { sourceReference: { $type: 'string' } } },
);

export default mongoose.models.AICreditAllocation || mongoose.model<IAICreditAllocation>('AICreditAllocation', AICreditAllocationSchema, 'ai_credit_allocations');
