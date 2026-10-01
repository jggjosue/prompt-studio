import mongoose, { Schema } from 'mongoose';

const FounderOutreachCohortReviewSchema = new Schema({
  cohort: { type: String, default: 'first_100', index: true },
  checkpoint: { type: Number, enum: [25, 50, 75, 100], required: true },
  reviewedBy: { type: String, required: true },
  reviewedAt: { type: Date, required: true, default: Date.now },
  attempted: { type: Number, required: true, min: 0 },
  delivered: { type: Number, required: true, min: 0 },
  replies: { type: Number, required: true, min: 0 },
  positiveReplies: { type: Number, required: true, min: 0 },
  demoTrials: { type: Number, required: true, min: 0 },
  activations: { type: Number, required: true, min: 0 },
  checkouts: { type: Number, required: true, min: 0 },
  paid: { type: Number, required: true, min: 0 },
  objectionsSummary: { type: [String], default: [] },
  requestedOutcomesSummary: { type: [String], default: [] },
  segmentDecision: { type: String, required: true, trim: true },
  messageDecision: { type: String, required: true, trim: true },
  nextHypothesis: { type: String, required: true, trim: true },
}, { timestamps: true, versionKey: false });

FounderOutreachCohortReviewSchema.index({ cohort: 1, checkpoint: 1 }, { unique: true });

export default mongoose.models.FounderOutreachCohortReview ||
  mongoose.model('FounderOutreachCohortReview', FounderOutreachCohortReviewSchema, 'founder_outreach_cohort_reviews');
