import mongoose, { Schema, Document } from 'mongoose';

export interface IRegisteredUser extends Document {
  email: string;
  createdAt: Date;
}

const RegisteredUserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.RegisteredUser || mongoose.model<IRegisteredUser>('RegisteredUser', RegisteredUserSchema, 'registered_users');
