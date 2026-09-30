import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';
import { rateLimit, tooManyRequests } from '@/lib/rate-limit';
import { requestCheckout } from '@/lib/domain-order';

export const runtime = 'nodejs';

const headers = () => cacheHeaders('private-no-store');
const CHECKOUT_LIMIT = { limit: 10, windowMs: 60_000 };

/**
 * POST /api/page-composer/domains/order/[id]/checkout  { siteId? }
 *
 * Confirmación explícita: re-verifica disponibilidad y precio **frescos** (nunca
 * se confía en la cotización vieja) y crea la sesión de Stripe con idempotencia.
 * Devuelve la URL de checkout.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Inicia sesión.' }, { status: 401, headers: headers() });

  const quota = await rateLimit({ key: `domain-checkout:${userId}`, ...CHECKOUT_LIMIT });
  if (!quota.ok) return tooManyRequests(quota);

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as { siteId?: string } | null;

  try {
    const { checkoutUrl } = await requestCheckout({ userId, orderId: id, siteId: body?.siteId });
    if (!checkoutUrl) return NextResponse.json({ error: 'Stripe no devolvió una URL de pago.' }, { status: 503, headers: headers() });
    return NextResponse.json({ checkoutUrl }, { headers: headers() });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo iniciar el pago.';
    return NextResponse.json({ error: message }, { status: 422, headers: headers() });
  }
}