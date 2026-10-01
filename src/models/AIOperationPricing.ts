import mongoose, { Document, Schema } from 'mongoose';

export interface IAIOperationPricing extends Document {
  operationCode: string;
  displayName: string;
  category: string;
  creditCost: number;
  isFree: boolean;
  enabled: boolean;
  quality?: string | null;
  resolution?: string | null;
  durationSeconds?: number | null;
  minimumMarginPercent?: number | null;
  metadata?: Record<string, unknown>;
  effectiveAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AIOperationPricingSchema = new Schema<IAIOperationPricing>({
  operationCode: { type: String, required: true, unique: true, index: true, maxlength: 100 },
  displayName: { type: String, required: true, maxlength: 160 },
  category: { type: String, required: true, index: true, maxlength: 80 },
  creditCost: { type: Number, required: true, min: 0 },
  isFree: { type: Boolean, default: false },
  enabled: { type: Boolean, default: true, index: true },
  quality: { type: String, default: null, maxlength: 80 },
  resolution: { type: String, default: null, maxlength: 80 },
  durationSeconds: { type: Number, default: null, min: 0 },
  minimumMarginPercent: { type: Number, default: null, min: 0, max: 100 },
  metadata: { type: Schema.Types.Mixed, default: {} },
  effectiveAt: { type: Date, default: Date.now, index: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { versionKey: false });

export default mongoose.models.AIOperationPricing || mongoose.model<IAIOperationPricing>('AIOperationPricing', AIOperationPricingSchema, 'ai_operation_pricing');
