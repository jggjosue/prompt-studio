import mongoose, { Document, Schema } from 'mongoose';

export type ObservabilityCategory = 'browser_error' | 'server_error' | 'web_vital' | 'resource_timing' | 'stripe' | 'ai_generation' | 'slow_query' | 'commerce';

export interface IObservabilityEvent extends Document {
  category: ObservabilityCategory;
  name: string;
  route: string;
  sessionId?: string | null;
  userId?: string | null;
  productId?: string | null;
  value?: number | null;
  unit?: string | null;
  status?: string | null;
  durationMs?: number | null;
  costUsd?: number | null;
  metadata: Record<string, unknown>;
  fingerprint?: string | null;
  createdAt: Date;
}

const ObservabilityEventSchema = new Schema<IObservabilityEvent>({
  category: { type: String, required: true, enum: ['browser_error', 'server_error', 'web_vital', 'resource_timing', 'stripe', 'ai_generation', 'slow_query', 'commerce'], index: true },
  name: { type: String, required: true, index: true },
  route: { type: String, required: true, index: true },
  sessionId: { type: String, default: null, index: true },
  userId: { type: String, default: null, index: true },
  productId: { type: String, default: null, index: true },
  value: { type: Number, default: null },
  unit: { type: String, default: null },
  status: { type: String, default: null, index: true },
  durationMs: { type: Number, default: null },
  costUsd: { type: Number, default: null },
  metadata: { type: Schema.Types.Mixed, default: {} },
  fingerprint: { type: String, default: null, index: true },
  createdAt: { type: Date, default: Date.now, index: true, expires: 60 * 60 * 24 * 90 },
}, { versionKey: false });

ObservabilityEventSchema.index({ route: 1, productId: 1, createdAt: -1 });
ObservabilityEventSchema.index({ category: 1, name: 1, createdAt: -1 });
ObservabilityEventSchema.index({ userId: 1, category: 1, createdAt: -1 });

export default mongoose.models.ObservabilityEvent || mongoose.model<IObservabilityEvent>('ObservabilityEvent', ObservabilityEventSchema, 'observability_events');
