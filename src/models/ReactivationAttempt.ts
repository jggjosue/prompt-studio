import mongoose, { Schema } from 'mongoose';

const ReactivationAttemptSchema = new Schema({
  userId: { type: String, required: true, index: true },
  window: { type: String, enum: ['7d', '30d'], required: true },
  priorCategory: { type: String, enum: ['image', 'video', 'web', 'prompt', 'unknown'], default: 'unknown' },
  campaignId: { type: String, required: true, index: true },
  sentAt: { type: Date, required: true, default: Date.now, index: true },
  returnedAt: { type: Date, default: null },
  activatedAt: { type: Date, default: null },
  checkoutAt: { type: Date, default: null },
  purchasedAt: { type: Date, default: null },
}, { versionKey: false });

ReactivationAttemptSchema.index({ userId: 1, window: 1 }, { unique: true });

export default mongoose.models.ReactivationAttempt ||
  mongoose.model('ReactivationAttempt', ReactivationAttemptSchema, 'reactivation_attempts');
