import mongoose, { Schema, Document } from 'mongoose';

export interface INewUser extends Document {
  email: string;
  createdAt: Date;
}

const NewUserSchema: Schema = new Schema({
  email: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// El tercer parámetro 'new_users' fuerza el nombre de la colección
export default mongoose.models.NewUser || mongoose.model<INewUser>('NewUser', NewUserSchema, 'new_users');
