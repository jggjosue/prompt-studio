import mongoose, { Schema, type Document, type Types } from 'mongoose';

/** Evento agregado de un sitio publicado. No guarda IP, email ni user-agent. */
export interface IPageComposerAnalyticsEvent extends Document {
  siteId: Types.ObjectId;
  kind: 'page_view' | 'cta_click' | 'form_conversion';
  page: string;
  referrer?: string | null;
  country?: string | null;
  visitorHash: string;
  createdAt: Date;
}

const schema = new Schema<IPageComposerAnalyticsEvent>(
  {
    siteId: { type: Schema.Types.ObjectId, required: true, index: true },
    kind: { type: String, enum: ['page_view', 'cta_click', 'form_conversion'], required: true },
    page: { type: String, required: true, maxlength: 300 },
    referrer: { type: String, default: null, maxlength: 253 },
    country: { type: String, default: null, maxlength: 2 },
    visitorHash: { type: String, required: true, maxlength: 64 },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { versionKey: false }
);
schema.index({ siteId: 1, createdAt: -1 });
schema.index({ siteId: 1, kind: 1, createdAt: -1 });

export default mongoose.models.PageComposerAnalyticsEvent ||
  mongoose.model<IPageComposerAnalyticsEvent>('PageComposerAnalyticsEvent', schema, 'page_composer_analytics_events');
