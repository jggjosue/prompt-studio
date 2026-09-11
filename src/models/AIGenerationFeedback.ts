import mongoose, { Schema, Document } from 'mongoose';

/**
 * Los motivos viven en `@/lib/generation-feedback`, sin dependencias: los
 * necesita también el componente de interfaz, y importarlos desde aquí metería
 * mongoose en el bundle del navegador.
 */
import { FEEDBACK_REASONS, type FeedbackReason } from '@/lib/generation-feedback';

export { FEEDBACK_REASONS, isFeedbackReason, type FeedbackReason } from '@/lib/generation-feedback';

export interface IAIGenerationFeedback extends Document {
  jobId: string;
  userId: string;
  kind: string;
  provider: string;
  useful: boolean;
  reason: FeedbackReason | null;
  comment: string | null;
  rating: number | null;
  recommendation: string | null;
  publishReview: boolean;
  publishResult: boolean;
  resultUrl: string | null;
  modelUsed: string | null;
  promptVersionNumber: number | null;
  verifiedPurchase: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Juicio humano sobre el resultado de una generación.
 *
 * `AIGenerationJob` ya registra qué se pidió, a qué proveedor, cuánto tardó y
 * cuánto costó. Lo que no registraba es si el resultado **sirvió**:
 * `status: 'completed'` significa que el proveedor devolvió algo, no que fuera
 * bueno. Sin esa señal no se puede comparar proveedores para el mismo prompt,
 * ni detectar que un modelo se ha degradado tras una actualización.
 *
 * Se guarda como documento aparte y no como campo del trabajo porque interesa
 * conservar la historia: una valoración se puede cambiar, y el `updatedAt` deja
 * constancia. En el trabajo se denormaliza solo `feedbackUseful` para poder
 * filtrar sin cruzar colecciones.
 *
 * `kind` y `provider` se copian del trabajo. Es redundante, pero permite
 * agregar por proveedor —que es la consulta principal— sin un `$lookup`.
 *
 * NOTA SOBRE USO POSTERIOR: estas valoraciones son datos de usuario. La política
 * de privacidad vigente declara que no se usan para entrenar modelos salvo
 * consentimiento específico. Licenciarlas exigiría un opt-in explícito recogido
 * **en el momento de la valoración**; un consentimiento retroactivo no es válido
 * bajo GDPR. Este esquema no lo presupone ni lo simula.
 */
const AIGenerationFeedbackSchema: Schema = new Schema({
  jobId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  kind: { type: String, required: true, index: true },
  provider: { type: String, required: true, index: true },
  useful: { type: Boolean, required: true },
  reason: { type: String, enum: [...FEEDBACK_REASONS, null], default: null },
  /** Texto libre del usuario: puede contener datos personales. Ver la nota de arriba. */
  comment: { type: String, default: null, maxlength: 1000 },
  rating: { type: Number, default: null, min: 1, max: 5 },
  recommendation: { type: String, default: null, maxlength: 500 },
  publishReview: { type: Boolean, default: false, index: true },
  publishResult: { type: Boolean, default: false },
  resultUrl: { type: String, default: null, maxlength: 2000 },
  modelUsed: { type: String, default: null, maxlength: 120 },
  promptVersionNumber: { type: Number, default: null, min: 1 },
  verifiedPurchase: { type: Boolean, default: false, index: true },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now },
});

/** Una valoración por usuario y trabajo, actualizable. */
AIGenerationFeedbackSchema.index({ jobId: 1, userId: 1 }, { unique: true });
/** Consulta principal: tasa de aprobación por proveedor y tipo, en el tiempo. */
AIGenerationFeedbackSchema.index({ provider: 1, kind: 1, createdAt: -1 });

export default mongoose.models.AIGenerationFeedback ||
  mongoose.model<IAIGenerationFeedback>(
    'AIGenerationFeedback',
    AIGenerationFeedbackSchema,
    'ai_generation_feedback'
  );
