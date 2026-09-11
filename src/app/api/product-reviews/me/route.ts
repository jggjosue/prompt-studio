import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';
import { getOwnReview, getReviewEligibility } from '@/lib/product-reviews';

/**
 * Parte personalizada de las reseñas: la propia y si puede escribir.
 *
 * Separada de la ruta pública porque aquella se cachea en CDN y esta no puede
 * cachearse nunca. Devuelve 401 sin sesión, que es una respuesta barata.
 */
export async function GET(request: Request) {
  const headers = cacheHeaders('private-no-store');
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'No autorizado.' }, { status: 401, headers });

  const url = new URL(request.url);
  const productId = (url.searchParams.get('productId') ?? '').trim().slice(0, 200);
  if (!productId) return NextResponse.json({ error: 'Falta el producto.' }, { status: 400, headers });
  const slug = (url.searchParams.get('slug') ?? '').trim() || null;

  const [own, eligibility] = await Promise.all([
    getOwnReview(userId, productId),
    getReviewEligibility({ userId, productId, slug }),
  ]);
  return NextResponse.json({ own, eligibility }, { headers });
}
