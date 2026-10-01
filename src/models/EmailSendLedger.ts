import mongoose, { Schema } from 'mongoose';

const EmailSendLedgerSchema = new Schema({
  recipientKey: { type: String, required: true, index: true },
  kind: { type: String, enum: ['checkout', 'onboarding', 'reactivation', 'newsletter', 'sales'], required: true, index: true },
  campaignId: { type: String, default: null, index: true },
  scheduledAt: { type: Date, default: null, index: true },
  eligibilityCheckedAt: { type: Date, default: null },
  sentAt: { type: Date, default: null, index: true },
  blockedReason: { type: String, default: null },
}, { timestamps: true, versionKey: false });

EmailSendLedgerSchema.index({ recipientKey: 1, sentAt: -1 });

export default mongoose.models.EmailSendLedger ||
  mongoose.model('EmailSendLedger', EmailSendLedgerSchema, 'email_send_ledger');
