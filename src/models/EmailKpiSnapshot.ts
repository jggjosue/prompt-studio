import mongoose, { Schema } from 'mongoose';

const EmailKpiSnapshotSchema = new Schema({
  periodStart: { type: Date, required: true, index: true },
  periodEnd: { type: Date, required: true, index: true },
  campaignId: { type: String, default: null, index: true },
  sequenceId: { type: String, default: null, index: true },
  counts: { type: Schema.Types.Mixed, required: true },
  metrics: { type: Schema.Types.Mixed, required: true },
  reconciledAt: { type: Date, required: true },
  reviewedAt: { type: Date, default: null },
  reviewedBy: { type: String, default: null },
}, { timestamps: true, versionKey: false });

EmailKpiSnapshotSchema.index({ periodStart: 1, periodEnd: 1, campaignId: 1, sequenceId: 1 }, { unique: true });

export default mongoose.models.EmailKpiSnapshot ||
  mongoose.model('EmailKpiSnapshot', EmailKpiSnapshotSchema, 'email_kpi_snapshots');
