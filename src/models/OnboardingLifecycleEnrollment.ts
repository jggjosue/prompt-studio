import mongoose, { Schema, Document } from 'mongoose';

export interface IOnboardingLifecycleEnrollment extends Document {
  userId: string;
  enrolledAt: Date;
  nextStep: number;
  completedAt?: Date | null;
  lastAttemptAt?: Date | null;
  lastProviderMessageId?: string | null;
}

const schema = new Schema<IOnboardingLifecycleEnrollment>({
  userId: { type: String, required: true, unique: true, index: true },
  enrolledAt: { type: Date, required: true, default: Date.now, index: true },
  nextStep: { type: Number, required: true, default: 1, min: 1, max: 6, index: true },
  completedAt: { type: Date, default: null },
  lastAttemptAt: { type: Date, default: null },
  lastProviderMessageId: { type: String, default: null },
}, { timestamps: true });

export default mongoose.models.OnboardingLifecycleEnrollment ||
  mongoose.model<IOnboardingLifecycleEnrollment>('OnboardingLifecycleEnrollment', schema);
