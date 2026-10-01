import mongoose, { Schema } from 'mongoose';

const UserActivationSchema = new Schema({
  userId: { type: String, required: true, unique: true, index: true },
  activatedAt: { type: Date, required: true, default: Date.now },
  activationType: { type: String, enum: ['save_prompt', 'use_prompt', 'generate_image', 'generate_video', 'generate_web'], required: true },
}, { versionKey: false, timestamps: true });

export default mongoose.models.UserActivation ||
  mongoose.model('UserActivation', UserActivationSchema, 'user_activations');
