import mongoose, { Schema, Document } from 'mongoose';

export interface ICookieConsent extends Document {
  email: string;
  clerkUserId: string;
  privacyPolicyVersion: string;
  termsOfServiceVersion: string;
  acceptedAt: Date;
}

const CookieConsentSchema: Schema = new Schema({
  email: { type: String, required: true },
  clerkUserId: { type: String, required: true },
  privacyPolicyVersion: { type: String, required: true },
  termsOfServiceVersion: { type: String, required: true },
  acceptedAt: { type: Date, default: Date.now },
});

export const CookieConsent = mongoose.models.CookieConsent || mongoose.model<ICookieConsent>('CookieConsent', CookieConsentSchema);
