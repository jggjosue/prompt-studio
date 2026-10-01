import mongoose, { Document, Schema } from 'mongoose';

export interface IAIProviderPricing extends Document {
  provider: string;
  modelId: string;
  currency: string;
  inputCostPerMillionTokens?: number | null;
  outputCostPerMillionTokens?: number | null;
  imageCostUsd?: number | null;
  videoCostPerSecondUsd?: number | null;
  effectiveAt: Date;
  verifiedAt?: Date | null;
  enabled: boolean;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const AIProviderPricingSchema = new Schema<IAIProviderPricing>({
  provider: { type: String, required: true, index: true, maxlength: 80 },
  modelId: { type: String, required: true, index: true, maxlength: 160 },
  currency: { type: String, required: true, default: 'USD', uppercase: true, maxlength: 3 },
  inputCostPerMillionTokens: { type: Number, default: null, min: 0 },
  outputCostPerMillionTokens: { type: Number, default: null, min: 0 },
  imageCostUsd: { type: Number, default: null, min: 0 },
  videoCostPerSecondUsd: { type: Number, default: null, min: 0 },
  effectiveAt: { type: Date, required: true, default: Date.now, index: true },
  verifiedAt: { type: Date, default: null },
  enabled: { type: Boolean, default: true, index: true },
  metadata: { type: Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { versionKey: false });

AIProviderPricingSchema.index({ provider: 1, modelId: 1, effectiveAt: -1 }, { unique: true });

export default mongoose.models.AIProviderPricing || mongoose.model<IAIProviderPricing>('AIProviderPricing', AIProviderPricingSchema, 'ai_provider_pricing');
