import mongoose, { Schema } from 'mongoose';

const WeeklyNewsletterIssueSchema = new Schema({
  issueId: { type: String, required: true, unique: true, index: true },
  campaignId: { type: String, required: true, unique: true, index: true },
  resendBroadcastId: { type: String, default: null, index: true },
  status: { type: String, enum: ['draft', 'ready', 'sent'], default: 'draft', index: true },
  sentAt: { type: Date, default: null },
}, { timestamps: true, versionKey: false });

export default mongoose.models.WeeklyNewsletterIssue ||
  mongoose.model('WeeklyNewsletterIssue', WeeklyNewsletterIssueSchema, 'weekly_newsletter_issues');
