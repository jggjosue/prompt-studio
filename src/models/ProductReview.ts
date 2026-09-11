import mongoose, { Document, Schema } from 'mongoose';

/**
 * Reseña de un producto del catálogo escrita por quien lo adquirió.
 *
 * Distinta de `AIGenerationFeedback`, que valora el resultado de una generación
 * concreta: aquí se valora el producto que se vende, y es lo que ve un visitante
 * antes de comprar.
 *
 * Solo se admite reseña de quien tiene el producto: compra explícita o plan con
 * derecho de descarga. `verifiedPurchase` se reserva para la compra explícita,
 * porque es lo único que se puede demostrar contra un pago; el distintivo de
 * «compra verificada» solo se muestra en ese caso.
 *
 * NOTA SOBRE DATOS PERSONALES: `comment` y `authorName` son datos de usuario.
 * `authorName` se guarda deliberadamente recortado (nombre e inicial) en el
 * momento de escribir la reseña, para no depender después del perfil ni exponer
 * el apellido completo o el correo.
 */
export interface IProductReview extends Document {
  productId: string;
  productKind: string;
  userId: string;
  authorName: string;
  rating: number;
  comment: string;
  verifiedPurchase: boolean;
  /** `pending` espera revisión humana; nunca se borra en automático. */
  status: 'published' | 'pending' | 'rejected';
  moderationReasons: string[];
  /** Votos de otros usuarios sobre si la reseña resultó útil. */
  helpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductReviewSchema = new Schema<IProductReview>({
  productId: { type: String, required: true, index: true },
  productKind: { type: String, required: true, default: 'web-page' },
  userId: { type: String, required: true, index: true },
  authorName: { type: String, required: true, maxlength: 80 },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, maxlength: 1500 },
  verifiedPurchase: { type: Boolean, default: false, index: true },
  status: { type: String, enum: ['published', 'pending', 'rejected'], default: 'pending', index: true },
  moderationReasons: { type: [String], default: [] },
  helpfulCount: { type: Number, default: 0, min: 0 },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now },
}, { versionKey: false });

/** Una reseña por usuario y producto, editable. Sin esto, un doble envío duplica. */
ProductReviewSchema.index({ productId: 1, userId: 1 }, { unique: true });
/** Consulta principal: reseñas publicadas de un producto, compras verificadas primero. */
ProductReviewSchema.index({ productId: 1, status: 1, verifiedPurchase: -1, createdAt: -1 });

export default mongoose.models.ProductReview || mongoose.model<IProductReview>('ProductReview', ProductReviewSchema, 'product_reviews');
