import mongoose, { Schema, Document } from 'mongoose';

export interface IUserInterest extends Document {
  userId: string;
  email: string;
  interests: string[];
  lastUpdatedAt: Date;
}

const UserInterestSchema: Schema = new Schema({
  userId: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, index: true },
  interests: { type: [String], default: [] },
  lastUpdatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.UserInterest ||
  mongoose.model<IUserInterest>('UserInterest', UserInterestSchema, 'user_interests');
