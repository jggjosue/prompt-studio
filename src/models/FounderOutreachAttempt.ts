import mongoose, { Schema } from 'mongoose';

const FounderOutreachAttemptSchema = new Schema({
  prospectId: { type: Schema.Types.ObjectId, ref: 'B2BProspect', required: true, index: true },
  cohort: { type: String, default: 'first_100', index: true },
  ordinal: { type: Number, required: true, min: 1, max: 100, unique: true },
  segment: { type: String, enum: ['creative_agency', 'ecommerce_brand', 'saas_marketing_team', 'independent_creator'], required: true, index: true },
  personalizationNote: { type: String, required: true },
  reviewedBy: { type: String, required: true },
  reviewedAt: { type: Date, required: true },
  senderIdentity: { type: String, required: true },
  sentAt: { type: Date, default: null },
  deliveredAt: { type: Date, default: null },
  repliedAt: { type: Date, default: null },
  positiveReplyAt: { type: Date, default: null },
  demoTrialAt: { type: Date, default: null },
  activatedAt: { type: Date, default: null },
  checkoutAt: { type: Date, default: null },
  paidAt: { type: Date, default: null },
}, { timestamps: true, versionKey: false });

FounderOutreachAttemptSchema.index({ prospectId: 1, cohort: 1 }, { unique: true });

export default mongoose.models.FounderOutreachAttempt ||
  mongoose.model('FounderOutreachAttempt', FounderOutreachAttemptSchema, 'founder_outreach_attempts');
