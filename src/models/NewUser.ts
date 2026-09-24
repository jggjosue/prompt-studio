import mongoose, { Schema, Document } from 'mongoose';

export interface INewUser extends Document {
  email: string;
  /** Token opaco que vincula el navegador con el correo guardado (cookie httpOnly). */
  visitorToken?: string | null;
  marketingStatus: 'not_requested' | 'pending' | 'confirmed' | 'unsubscribed';
  marketingConsentRequestedAt?: Date | null;
  marketingConfirmedAt?: Date | null;
  marketingConfirmationTokenHash?: string | null;
  marketingConfirmationExpiresAt?: Date | null;
  createdAt: Date;
}

const NewUserSchema: Schema = new Schema({
  email: { type: String, required: true },
  visitorToken: { type: String, default: null, index: true, sparse: true },
  marketingStatus: {
    type: String,
    enum: ['not_requested', 'pending', 'confirmed', 'unsubscribed'],
    default: 'not_requested',
    index: true,
  },
  marketingConsentRequestedAt: { type: Date, default: null },
  marketingConfirmedAt: { type: Date, default: null, index: true },
  marketingConfirmationTokenHash: { type: String, default: null, index: true, sparse: true },
  marketingConfirmationExpiresAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

// El tercer parámetro 'user_profiles' fuerza el nombre de la colección
export default mongoose.models.NewUser || mongoose.model<INewUser>('NewUser', NewUserSchema, 'user_profiles');
