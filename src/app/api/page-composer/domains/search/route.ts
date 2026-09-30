import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';
import { rateLimit, tooManyRequests } from '@/lib/rate-limit';
import { searchDomains } from '@/lib/domain-search';
import { resolveDomainProvider } from '@/lib/registrars';
import { POPULAR_TLDS } from '@/lib/domain-provider';

export const runtime = 'nodejs';

const headers = () => cacheHeaders('private-no-store');
const SEARCH_LIMIT = { limit: 30, windowMs: 60_000 };

/**
 * GET /api/page-composer/domains/search?term=companyname&tlds=com,ai,dev
 *
 * Sugerencias de descubrimiento (usa caché interna). Los resultados de
 * disponibilidad NUNCA se usan para autorizar una compra: el registro vuelve a
 * consultar al proveedor justo antes.
 */
export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Inicia sesión.' }, { status: 401, headers: headers() });

  const quota = await rateLimit({ key: `domain-search:${userId}`, ...SEARCH_LIMIT });
  if (!quota.ok) return tooManyRequests(quota);

  const term = (new URL(request.url).searchParams.get('term') ?? '').trim();
  if (!term) return NextResponse.json({ error: 'Escribe un nombre.' }, { status: 400, headers: headers() });

  const rawTlds = new URL(request.url).searchParams.get('tlds') ?? '';
  const tlds = rawTlds
    ? rawTlds.split(',').map(tld => tld.trim().replace(/^\./, '')).filter(Boolean).slice(0, 6)
    : [...POPULAR_TLDS].slice(0, 3);

  const provider = resolveDomainProvider();
  const results = await searchDomains(term, provider, tlds);
  return NextResponse.json(
    { results, provider: provider.id, cached: true },
    { headers: headers() }
  );
}