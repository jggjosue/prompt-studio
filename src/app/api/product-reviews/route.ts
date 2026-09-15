import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';
import connectToDatabase from '@/lib/mongoose';
import { getProductReviews, getReviewEligibility } from '@/lib/product-reviews';
import {
  buildAuthorName,
  isValidRating,
  normalizeReviewComment,
  REVIEW_COMMENT_MIN,
  screenReviewText,
} from '@/lib/review-moderation';
import { rateLimit, RATE_LIMITS, tooManyRequests } from '@/lib/rate-limit';
import ProductReview from '@/models/ProductReview';

function readProductId(url: URL): string {
  return (url.searchParams.get('productId') ?? '').trim().slice(0, 200);
}

/**
 * Reseñas publicadas de un producto. Público y cacheable.
 *
 * No mira la sesión a propósito. La respuesta se cachea en CDN, y si esta misma
 * URL devolviera a veces datos del usuario, el primero en pedirla sin sesión
 * dejaría cacheada durante horas una versión sin formulario que verían también
 * los compradores. Lo personalizado vive en `/api/product-reviews/me`.
 */
export async function GET(request: Request) {
  const productId = readProductId(new URL(request.url));
  if (!productId) {
    return NextResponse.json({ error: 'Falta el producto.' }, { status: 400, headers: cacheHeaders('private-no-store') });
  }
  const data = await getProductReviews(productId);
  // TTL corto: una reseña nueva debe aparecer en minutos, no al día siguiente.
  const headers = cacheHeaders('public-catalog');
  headers.set('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=3600');
  headers.set('CDN-Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
  headers.set('Vercel-CDN-Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
  return NextResponse.json(data, { headers });
}

/**
 * Crea o actualiza la reseña del usuario para un producto.
 *
 * Solo puede reseñar quien tiene el producto. Es la diferencia entre prueba
 * social y un muro de comentarios: sin esa comprobación cualquiera podría
 * puntuar un producto que no ha usado.
 */
export async function POST(request: Request) {
  const headers = cacheHeaders('private-no-store');
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Inicia sesión para reseñar.' }, { status: 401, headers });

  const quota = await rateLimit({ key: `product-review:${userId}`, ...RATE_LIMITS.publicWrite });
  if (!quota.ok) return tooManyRequests(quota);

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const productId = typeof body?.productId === 'string' ? body.productId.trim().slice(0, 200) : '';
  const productKind = typeof body?.productKind === 'string' ? body.productKind.trim().slice(0, 40) : 'web-page';
  const slug = typeof body?.slug === 'string' ? body.slug.trim().slice(0, 200) : null;
  const rating = body?.rating;
  const comment = normalizeReviewComment(body?.comment);

  if (!productId) return NextResponse.json({ error: 'Falta el producto.' }, { status: 400, headers });
  if (!isValidRating(rating)) return NextResponse.json({ error: 'La puntuación debe ser un número entero de 1 a 5.' }, { status: 400, headers });
  if (comment.length < REVIEW_COMMENT_MIN) {
    return NextResponse.json({ error: `Cuenta algo más: al menos ${REVIEW_COMMENT_MIN} caracteres.` }, { status: 400, headers });
  }

  const eligibility = await getReviewEligibility({ userId, productId, slug });
  if (!eligibility.canReview) {
    return NextResponse.json({ error: 'Solo puede reseñar quien ha comprado o descargado este producto.' }, { status: 403, headers });
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const authorName = buildAuthorName(user.firstName, user.lastName);
  const screening = screenReviewText(comment);
  const now = new Date();

  await connectToDatabase();
  await ProductReview.updateOne(
    { productId, userId },
    {
      $set: {
        productKind,
        authorName,
        rating,
        comment,
        verifiedPurchase: eligibility.verifiedPurchase,
        status: screening.status,
        moderationReasons: screening.reasons,
        updatedAt: now,
      },
      $setOnInsert: { productId, userId, helpfulCount: 0, createdAt: now },
    },
    { upsert: true }
  );

  return NextResponse.json({
    status: screening.status,
    verifiedPurchase: eligibility.verifiedPurchase,
    moderationReasons: screening.reasons,
  }, { status: 201, headers });
}
