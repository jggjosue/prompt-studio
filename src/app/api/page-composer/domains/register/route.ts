import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';
import { rateLimit, tooManyRequests } from '@/lib/rate-limit';
import { registerDomain } from '@/lib/domain-search';
import { resolveDomainProvider } from '@/lib/registrars';
import { recordObservabilityEvent } from '@/lib/observability-server';

export const runtime = 'nodejs';

const headers = () => cacheHeaders('private-no-store');
const REGISTER_LIMIT = { limit: 5, windowMs: 60_000 };

/**
 * POST /api/page-composer/domains/register  { hostname }
 *
 * Registra un dominio. Justo antes de comprar se hace una comprobación **fresca**
 * de disponibilidad y precio (nunca se confía en un resultado antiguo); si el
 * dominio ya no está disponible, se rechaza.
 */
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Inicia sesión.' }, { status: 401, headers: headers() });

  const quota = await rateLimit({ key: `domain-register:${userId}`, ...REGISTER_LIMIT });
  if (!quota.ok) return tooManyRequests(quota);

  const body = (await request.json().catch(() => null)) as { hostname?: string } | null;
  const hostname = body?.hostname?.trim().toLowerCase() ?? '';
  if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.[a-z]{2,63}$/.test(hostname)) {
    return NextResponse.json({ error: 'Dominio inválido.' }, { status: 400, headers: headers() });
  }

  const provider = resolveDomainProvider();
  const outcome = await registerDomain(hostname, provider);

  await recordObservabilityEvent({
    category: 'commerce',
    name: 'page_composer_domain_register',
    route: '/api/page-composer/domains/register',
    userId,
    status: outcome.ok ? 'success' : 'error',
    metadata: { hostname, provider: provider.id, code: outcome.ok ? 'ok' : outcome.code },
  });

  if (!outcome.ok) {
    const status = outcome.code === 'NOT_AVAILABLE' ? 409 : outcome.code === 'NOT_SUPPORTED' ? 503 : 422;
    return NextResponse.json({ error: outcome.message, code: outcome.code }, { status, headers: headers() });
  }

  return NextResponse.json(
    { orderId: outcome.orderId, status: outcome.status, price: outcome.price, hostname },
    { headers: headers() }
  );
}