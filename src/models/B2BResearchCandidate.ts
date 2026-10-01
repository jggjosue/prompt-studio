import mongoose, { Schema } from 'mongoose';

const B2BResearchCandidateSchema = new Schema({
  company: { type: String, required: true, trim: true, index: true },
  website: { type: String, default: null },
  segment: { type: String, default: null },
  region: { type: String, default: null },
  useCase: { type: String, required: true },
  qualificationReason: { type: String, required: true },
  sourceUrl: { type: String, required: true },
  sourceType: { type: String, required: true },
  discoveredAt: { type: Date, default: Date.now, index: true },
  publicBusinessContact: { type: String, default: null },
  reviewStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
  reviewedAt: { type: Date, default: null },
  reviewedBy: { type: String, default: null },
  outreachAllowed: { type: Boolean, default: false, index: true },
}, { timestamps: true, versionKey: false });

B2BResearchCandidateSchema.index({ company: 1, sourceUrl: 1 }, { unique: true });

export default mongoose.models.B2BResearchCandidate ||
  mongoose.model('B2BResearchCandidate', B2BResearchCandidateSchema, 'b2b_research_candidates');
