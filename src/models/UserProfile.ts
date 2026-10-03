import mongoose, { Schema, Document } from 'mongoose';

export interface IUserProfile extends Document {
  userId: string;
  email: string;
  birthDate?: string | null;
  paypalEmail?: string | null;
  marketingOptIn: boolean;
  consentTimestamp?: Date | null;
  consentSource?: string | null;
  consentVersion?: string | null;
  unsubscribeTimestamp?: Date | null;
  emailSuppressedAt?: Date | null;
  emailSuppressionReason?: 'unsubscribe' | 'hard_bounce' | 'complaint' | 'manual' | null;
  emailDoNotContact: boolean;
  emailPreferenceTopics: string[];
  emailLocale?: string | null;
  emailPreferencesUpdatedAt?: Date | null;
  emailPreferenceAudit: Array<{
    changedAt: Date;
    source: string;
    marketingOptIn: boolean;
    topics: string[];
    locale?: string | null;
    consentVersion?: string | null;
  }>;
  lastUpdatedAt: Date;
}

/**
 * Perfil de un usuario registrado.
 *
 * ATENCIÓN: esta colección, `user_profiles`, la comparte con el modelo
 * `NewUser`, que guarda correos de personas que aún no tienen cuenta —los leads
 * de las descargas gratuitas—. La ruta canónica
 * `/api/sync-registered-users-to-resend` selecciona explícitamente los perfiles
 * registrados y conserva su consentimiento y sus supresiones al reconciliarlos
 * con Resend.
 *
 * Consecuencia sobre el índice: `userId` **no puede ser único a secas**. Un lead
 * se inserta sin ese campo, MongoDB lo interpreta como `null`, y con un índice
 * único normal solo el primer lead entra: todos los siguientes fallan con
 * E11000. Eso ocurría en producción y hacía que `/api/new-users` devolviera 500
 * silenciosamente en cada captura de correo.
 *
 * Por eso la unicidad se declara parcial: solo aplica a los documentos que
 * tienen `userId` de tipo cadena, es decir, a los perfiles reales.
 */
const UserProfileSchema: Schema = new Schema({
  userId: { type: String, required: true, index: true },
  email: { type: String, required: true, index: true },
  birthDate: { type: String, default: null },
  paypalEmail: { type: String, default: null },
  // Promotional consent is explicit: creating an account never opts a user in.
  marketingOptIn: { type: Boolean, default: false, index: true },
  consentTimestamp: { type: Date, default: null },
  consentSource: { type: String, default: null },
  consentVersion: { type: String, default: null },
  unsubscribeTimestamp: { type: Date, default: null },
  emailSuppressedAt: { type: Date, default: null, index: true },
  emailSuppressionReason: { type: String, enum: ['unsubscribe', 'hard_bounce', 'complaint', 'manual', null], default: null },
  emailDoNotContact: { type: Boolean, default: false, index: true },
  emailPreferenceTopics: { type: [String], default: [] },
  emailLocale: { type: String, default: null },
  emailPreferencesUpdatedAt: { type: Date, default: null },
  emailPreferenceAudit: {
    type: [{
      _id: false,
      changedAt: { type: Date, required: true },
      source: { type: String, required: true },
      marketingOptIn: { type: Boolean, required: true },
      topics: { type: [String], default: [] },
      locale: { type: String, default: null },
      consentVersion: { type: String, default: null },
    }],
    default: [],
  },
  lastUpdatedAt: { type: Date, default: Date.now },
});

/**
 * Unicidad solo entre perfiles reales. Los leads sin `userId` quedan fuera.
 *
 * Cambiar las opciones de un índice existente no lo hace Mongoose: MongoDB
 * rechaza dos índices con la misma clave y opciones distintas
 * (IndexOptionsConflict). Hay que eliminar el `userId_1` antiguo y crear este,
 * con `scripts/fix-user-profiles-index.mjs`.
 */
UserProfileSchema.index(
  { userId: 1 },
  { unique: true, partialFilterExpression: { userId: { $type: 'string' } } }
);

export default mongoose.models.UserProfile ||
  mongoose.model<IUserProfile>('UserProfile', UserProfileSchema, 'user_profiles');
