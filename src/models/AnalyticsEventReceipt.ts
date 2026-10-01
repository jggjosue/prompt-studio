import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const AnalyticsEventReceiptSchema = new Schema({
  key: { type: String, required: true, unique: true, index: true },
  eventName: { type: String, required: true, index: true },
  source: { type: String, required: true },
  status: { type: String, enum: ['processing', 'completed', 'failed'], default: 'processing', index: true },
  completedAt: { type: Date, default: null },
  failedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 90 },
}, { versionKey: false });

export type AnalyticsEventReceiptDocument = InferSchemaType<typeof AnalyticsEventReceiptSchema>;

export default mongoose.models.AnalyticsEventReceipt ||
  mongoose.model('AnalyticsEventReceipt', AnalyticsEventReceiptSchema);
