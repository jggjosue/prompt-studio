import mongoose, { Schema, Document } from 'mongoose';

export interface IUserProfile extends Document {
  userId: string;
  email: string;
  birthDate?: string | null;
  paypalEmail?: string | null;
  lastUpdatedAt: Date;
}

const UserProfileSchema: Schema = new Schema({
  userId: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, index: true },
  birthDate: { type: String, default: null },
  paypalEmail: { type: String, default: null },
  lastUpdatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.UserProfile ||
  mongoose.model<IUserProfile>('UserProfile', UserProfileSchema, 'user_profiles');
