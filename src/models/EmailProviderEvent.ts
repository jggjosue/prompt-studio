import mongoose, { Schema, Document } from 'mongoose';

export interface IEmailProviderEvent extends Document {
  provider: 'resend';
  eventId: string;
  eventType: string;
  emailId?: string | null;
  recipient?: string | null;
  occurredAt: Date;
  campaignId?: string | null;
  sequenceId?: string | null;
  lifecycleTrigger?: string | null;
  destinationUrl?: string | null;
  utmCampaign?: string | null;
  receivedAt: Date;
}

const EmailProviderEventSchema = new Schema<IEmailProviderEvent>({
  provider: { type: String, enum: ['resend'], required: true },
  eventId: { type: String, required: true },
  eventType: { type: String, required: true, index: true },
  emailId: { type: String, default: null, index: true },
  recipient: { type: String, default: null, index: true },
  occurredAt: { type: Date, required: true },
  campaignId: { type: String, default: null, index: true },
  sequenceId: { type: String, default: null, index: true },
  lifecycleTrigger: { type: String, default: null },
  destinationUrl: { type: String, default: null },
  utmCampaign: { type: String, default: null, index: true },
  receivedAt: { type: Date, default: Date.now },
});

EmailProviderEventSchema.index({ provider: 1, eventId: 1 }, { unique: true });

export default mongoose.models.EmailProviderEvent ||
  mongoose.model<IEmailProviderEvent>('EmailProviderEvent', EmailProviderEventSchema, 'email_provider_events');
