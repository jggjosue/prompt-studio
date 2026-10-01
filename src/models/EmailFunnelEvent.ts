import mongoose, { Schema, Document } from 'mongoose';

export interface IEmailFunnelEvent extends Document {
  eventType: 'email_activation' | 'email_checkout' | 'email_purchase';
  campaignId: string;
  sequenceId?: string | null;
  lifecycleTrigger?: string | null;
  utmCampaign: string;
  occurredAt: Date;
  valueCents?: number | null;
  currency?: string | null;
}

const EmailFunnelEventSchema = new Schema<IEmailFunnelEvent>({
  eventType: { type: String, enum: ['email_activation', 'email_checkout', 'email_purchase'], required: true, index: true },
  campaignId: { type: String, required: true, index: true },
  sequenceId: { type: String, default: null, index: true },
  lifecycleTrigger: { type: String, default: null },
  utmCampaign: { type: String, required: true, index: true },
  occurredAt: { type: Date, default: Date.now, index: true },
  valueCents: { type: Number, default: null },
  currency: { type: String, default: null },
});

export default mongoose.models.EmailFunnelEvent ||
  mongoose.model<IEmailFunnelEvent>('EmailFunnelEvent', EmailFunnelEventSchema, 'email_funnel_events');
