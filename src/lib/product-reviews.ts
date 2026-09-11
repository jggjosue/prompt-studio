import 'server-only';
import connectToDatabase from '@/lib/mongoose';
import { getServerSubscriptionStatus, hasDownloadPlan } from '@/lib/server-subscription-status';
import ComponentPurchase from '@/models/ComponentPurchase';
import ProductReview from '@/models/ProductReview';

export type ReviewEligibility = {
  /** Puede escribir reseña: tiene el producto por compra o por plan. */
  canReview: boolean;
  /** Compra explícita demostrable contra un pago. Habilita el distintivo. */
  verifiedPurchase: boolean;
  reason: 'purchased' | 'plan' | 'not-acquired';
};

/**
 * Decide si un usuario puede reseñar un producto y si su compra es verificable.
 *
 * Se aceptan dos vías de adquisición y se distinguen a propósito:
 *
 * - Compra explícita (`ComponentPurchase` pagada, o el producto en las páginas
 *   compradas del usuario). Es la única demostrable contra un pago concreto, y
 *   la única que enseña «compra verificada».
 * - Plan con derecho de descarga. El usuario tiene acceso legítimo al producto,
 *   así que su opinión vale, pero no hay un pago por *este* artículo: se guarda
 *   con `verifiedPurchase: false` para no afirmar algo que no consta.
 *
 * `productId` y `slug` se comprueban ambos porque las páginas compradas se
 * guardan unas veces con el identificador de catálogo y otras con el slug.
 */
export async function getReviewEligibility(params: {
  userId: string;
  productId: string;
  slug?: string | null;
}): Promise<ReviewEligibility> {
  const { userId, productId } = params;
  const slug = params.slug?.trim() || null;

  await connectToDatabase();
  const purchasedComponent = await ComponentPurchase.exists({
    purchaserUserId: userId,
    productId,
    status: 'paid',
  });
  if (purchasedComponent) return { canReview: true, verifiedPurchase: true, reason: 'purchased' };

  const subscription = await getServerSubscriptionStatus();
  if (subscription) {
    const owned = subscription.purchasedPages.includes(productId) || (slug ? subscription.purchasedPages.includes(slug) : false);
    if (owned) return { canReview: true, verifiedPurchase: true, reason: 'purchased' };
    if (hasDownloadPlan(subscription)) return { canReview: true, verifiedPurchase: false, reason: 'plan' };
  }

  return { canReview: false, verifiedPurchase: false, reason: 'not-acquired' };
}

export type PublicProductReview = {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string | null;
};

export type ProductReviewSummary = {
  /** Media redondeada a un decimal, o null si aún no hay reseñas publicadas. */
  rating: number | null;
  ratingCount: number;
  /** Reparto de estrellas, de 1 a 5, para pintar la barra de distribución. */
  distribution: Record<'1' | '2' | '3' | '4' | '5', number>;
  verifiedCount: number;
};

const EMPTY_DISTRIBUTION = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 } as const;

/**
 * Reseñas publicadas de un producto y su resumen.
 *
 * Solo entra `status: 'published'`: lo retenido por moderación no cuenta para
 * la media, o un spammer podría mover la nota mientras espera revisión.
 */
export async function getProductReviews(productId: string, limit = 20): Promise<{
  summary: ProductReviewSummary;
  reviews: PublicProductReview[];
}> {
  await connectToDatabase();
  const query = { productId, status: 'published' as const };

  const [rows, buckets] = await Promise.all([
    ProductReview.find(query)
      .sort({ verifiedPurchase: -1, helpfulCount: -1, createdAt: -1 })
      .limit(limit)
      .select('authorName rating comment verifiedPurchase createdAt')
      .lean<Array<Record<string, unknown>>>(),
    ProductReview.aggregate<{ _id: number; count: number; verified: number }>([
      { $match: query },
      { $group: { _id: '$rating', count: { $sum: 1 }, verified: { $sum: { $cond: ['$verifiedPurchase', 1, 0] } } } },
    ]),
  ]);

  const distribution = { ...EMPTY_DISTRIBUTION } as Record<'1' | '2' | '3' | '4' | '5', number>;
  let total = 0;
  let weighted = 0;
  let verifiedCount = 0;
  for (const bucket of buckets) {
    const star = String(bucket._id) as '1' | '2' | '3' | '4' | '5';
    if (!(star in distribution)) continue;
    distribution[star] = bucket.count;
    total += bucket.count;
    weighted += bucket.count * bucket._id;
    verifiedCount += bucket.verified;
  }

  return {
    summary: {
      rating: total ? Math.round((weighted / total) * 10) / 10 : null,
      ratingCount: total,
      distribution,
      verifiedCount,
    },
    reviews: rows.map(row => ({
      id: String(row._id),
      authorName: String(row.authorName ?? ''),
      rating: Number(row.rating ?? 0),
      comment: String(row.comment ?? ''),
      verifiedPurchase: Boolean(row.verifiedPurchase),
      createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : null,
    })),
  };
}

/** Reseña propia del usuario, publicada o retenida, para poder editarla. */
export async function getOwnReview(userId: string, productId: string) {
  await connectToDatabase();
  const row = await ProductReview.findOne({ userId, productId })
    .select('rating comment status moderationReasons updatedAt')
    .lean<Record<string, unknown> | null>();
  if (!row) return null;
  return {
    rating: Number(row.rating ?? 0),
    comment: String(row.comment ?? ''),
    status: String(row.status ?? 'pending'),
    moderationReasons: Array.isArray(row.moderationReasons) ? row.moderationReasons.map(String) : [],
  };
}
