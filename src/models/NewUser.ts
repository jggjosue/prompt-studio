import mongoose, { Schema, Document } from 'mongoose';

export interface INewUser extends Document {
  email: string;
  /** Token opaco que vincula el navegador con el correo guardado (cookie httpOnly). */
  visitorToken?: string | null;
  createdAt: Date;
}

const NewUserSchema: Schema = new Schema({
  email: { type: String, required: true },
  visitorToken: { type: String, default: null, index: true, sparse: true },
  createdAt: { type: Date, default: Date.now },
});

// El tercer parámetro 'user_profiles' fuerza el nombre de la colección
export default mongoose.models.NewUser || mongoose.model<INewUser>('NewUser', NewUserSchema, 'user_profiles');
