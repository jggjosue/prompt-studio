import mongoose, { Document, Schema } from 'mongoose';

export interface IAffiliateApplication extends Document {
  fullName: string;
  email: string;
  profile: string;
  audience: string;
  channel: string;
  experience: string;
  tier: string;
  plan: string;
  message: string;
  sourcePath: string;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const AffiliateApplicationSchema = new Schema<IAffiliateApplication>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    profile: { type: String, default: '', trim: true },
    audience: { type: String, default: '', trim: true },
    channel: { type: String, default: '', trim: true },
    experience: { type: String, default: '', trim: true },
    tier: { type: String, required: true, trim: true },
    plan: { type: String, default: '', trim: true },
    message: { type: String, default: '', trim: true },
    sourcePath: { type: String, required: true, default: '/affiliate-program', index: true },
    status: { type: String, enum: ['pending', 'reviewed', 'approved', 'rejected'], default: 'pending', index: true },
    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export default mongoose.models.AffiliateApplication ||
  mongoose.model<IAffiliateApplication>('AffiliateApplication', AffiliateApplicationSchema, 'affiliate_applications');
