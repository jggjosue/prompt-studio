import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';
import { rateLimit, tooManyRequests } from '@/lib/rate-limit';
import { quoteDomain, type DomainOrder } from '@/lib/domain-order';

export const runtime = 'nodejs';

const headers = () => cacheHeaders('private-no-store');
const QUOTE_LIMIT = { limit: 20, windowMs: 60_000 };

function publicOrder(order: DomainOrder) {
  return {
    id: order.id,
    hostname: order.hostname,
    tld: order.tld,
    provider: order.provider,
    state: order.state,
    quote: order.quote,
    siteId: order.siteId ?? null,
    refundEligible: order.refundEligible,
  };
}

/**
 * POST /api/page-composer/domains/order  { hostname, siteId? }
 *
 * Cotiza un dominio (comprobación fresca de disponibilidad + precio fresco) y
 * crea la orden en `quoted`, lista para confirmar. La compra es independiente de
 * los créditos de IA.
 */
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Inicia sesión.' }, { status: 401, headers: headers() });

  const quota = await rateLimit({ key: `domain-quote:${userId}`, ...QUOTE_LIMIT });
  if (!quota.ok) return tooManyRequests(quota);

  const body = (await request.json().catch(() => null)) as { hostname?: string; siteId?: string } | null;
  const hostname = body?.hostname?.trim().toLowerCase() ?? '';
  if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.[a-z]{2,63}$/.test(hostname)) {
    return NextResponse.json({ error: 'Dominio inválido.' }, { status: 400, headers: headers() });
  }

  try {
    const order = await quoteDomain({ userId, hostname });
    return NextResponse.json({ order: publicOrder(order) }, { headers: headers() });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'No se pudo cotizar el dominio.' }, { status: 422, headers: headers() });
  }
}