import mongoose, { Schema, Document } from 'mongoose';

export interface IEmailProviderEvent extends Document {
  provider: 'resend';
  eventId: string;
  eventType: string;
  emailId?: string | null;
  recipient?: string | null;
  occurredAt: Date;
  receivedAt: Date;
}

const EmailProviderEventSchema = new Schema<IEmailProviderEvent>({
  provider: { type: String, enum: ['resend'], required: true },
  eventId: { type: String, required: true },
  eventType: { type: String, required: true, index: true },
  emailId: { type: String, default: null, index: true },
  recipient: { type: String, default: null, index: true },
  occurredAt: { type: Date, required: true },
  receivedAt: { type: Date, default: Date.now },
});

EmailProviderEventSchema.index({ provider: 1, eventId: 1 }, { unique: true });

export default mongoose.models.EmailProviderEvent ||
  mongoose.model<IEmailProviderEvent>('EmailProviderEvent', EmailProviderEventSchema, 'email_provider_events');
