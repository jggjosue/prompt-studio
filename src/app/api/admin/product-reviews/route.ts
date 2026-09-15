import { auth } from '@clerk/nextjs/server';
import { isPremiumJoAdmin } from '@/lib/admin-auth';
import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';
import connectToDatabase from '@/lib/mongoose';
import ProductReview from '@/models/ProductReview';

/**
 * Mismo criterio que el resto del área de administración: se delega en
 * `isPremiumJoAdmin`, la única definición de quién es administrador. Antes esta
 * comprobación estaba copiada aquí, y una regla de autorización duplicada es
 * justo donde se cuela el fallo cuando una de las copias se queda atrás.
 */
async function requireAdmin() {
  const { userId } = await auth();
  if (!userId) return { ok: false as const, status: 401, error: 'Unauthorized' };
  if (!(await isPremiumJoAdmin())) {
    return { ok: false as const, status: 403, error: 'Forbidden' };
  }
  return { ok: true as const, userId };
}

/** Cola de moderación: lo retenido por el cribado automático, lo más viejo primero. */
export async function GET(request: Request) {
  const headers = cacheHeaders('private-no-store');
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status, headers });

  const status = new URL(request.url).searchParams.get('status') ?? 'pending';
  if (!['pending', 'published', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'Estado no válido.' }, { status: 400, headers });
  }

  await connectToDatabase();
  const rows = await ProductReview.find({ status })
    .sort({ createdAt: 1 })
    .limit(100)
    .select('productId productKind authorName rating comment verifiedPurchase moderationReasons createdAt')
    .lean<Array<Record<string, unknown>>>();

  return NextResponse.json({
    reviews: rows.map(row => ({
      id: String(row._id),
      productId: String(row.productId ?? ''),
      productKind: String(row.productKind ?? ''),
      authorName: String(row.authorName ?? ''),
      rating: Number(row.rating ?? 0),
      comment: String(row.comment ?? ''),
      verifiedPurchase: Boolean(row.verifiedPurchase),
      moderationReasons: Array.isArray(row.moderationReasons) ? row.moderationReasons.map(String) : [],
      createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : null,
    })),
  }, { headers });
}

/**
 * Publica o rechaza una reseña retenida.
 *
 * Rechazar no borra: la reseña queda con `status: 'rejected'` y deja de contar
 * para la media, pero se conserva por si la decisión fue equivocada.
 */
export async function PATCH(request: Request) {
  const headers = cacheHeaders('private-no-store');
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status, headers });

  const body = await request.json().catch(() => null) as { id?: unknown; status?: unknown } | null;
  const id = typeof body?.id === 'string' ? body.id : '';
  const status = body?.status;
  if (!id || (status !== 'published' && status !== 'rejected')) {
    return NextResponse.json({ error: 'Indica la reseña y si se publica o se rechaza.' }, { status: 400, headers });
  }

  await connectToDatabase();
  const result = await ProductReview.updateOne({ _id: id }, { $set: { status, updatedAt: new Date() } });
  if (!result.matchedCount) return NextResponse.json({ error: 'Reseña no encontrada.' }, { status: 404, headers });

  return NextResponse.json({ id, status }, { headers });
}
