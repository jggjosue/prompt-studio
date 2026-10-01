import mongoose, { Schema } from 'mongoose';

const B2BProspectSchema = new Schema({
  dedupeKey: { type: String, required: true, unique: true, index: true },
  company: { type: String, required: true, trim: true },
  website: { type: String, default: null },
  segment: { type: String, default: null, index: true },
  region: { type: String, default: null },
  publicBusinessContact: { type: String, default: null },
  contactRole: { type: String, default: null },
  sourceUrl: { type: String, required: true },
  sourceType: { type: String, enum: ['company_site', 'directory', 'event', 'referral', 'manual'], required: true },
  useCase: { type: String, default: null },
  personalizationNote: { type: String, default: null },
  discoveredAt: { type: Date, default: Date.now, index: true },
  outreachStatus: { type: String, enum: ['new', 'qualified', 'contacted', 'replied', 'closed', 'deleted'], default: 'new', index: true },
  lastContactedAt: { type: Date, default: null },
  replyStatus: { type: String, enum: ['none', 'positive', 'neutral', 'negative'], default: 'none' },
  doNotContact: { type: Boolean, default: false, index: true },
  doNotContactAt: { type: Date, default: null },
  qualificationNotes: { type: String, default: null },
  deletedAt: { type: Date, default: null },
}, { timestamps: true, versionKey: false });

export default mongoose.models.B2BProspect || mongoose.model('B2BProspect', B2BProspectSchema, 'b2b_prospects');
