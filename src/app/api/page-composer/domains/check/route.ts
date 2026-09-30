import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';
import { rateLimit, tooManyRequests } from '@/lib/rate-limit';
import { authoritativeCheck } from '@/lib/domain-search';
import { resolveDomainProvider } from '@/lib/registrars';

export const runtime = 'nodejs';

const headers = () => cacheHeaders('private-no-store');
const CHECK_LIMIT = { limit: 30, windowMs: 60_000 };

/**
 * GET /api/page-composer/domains/check?hostname=companyname.com
 *
 * Comprobación **autoritativa y fresca**: sin caché y sin reutilizar resultados
 * viejos. Es la que se usa justo antes de registrar.
 */
export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Inicia sesión.' }, { status: 401, headers: headers() });

  const quota = await rateLimit({ key: `domain-check:${userId}`, ...CHECK_LIMIT });
  if (!quota.ok) return tooManyRequests(quota);

  const hostname = (new URL(request.url).searchParams.get('hostname') ?? '').trim().toLowerCase();
  if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.[a-z]{2,63}$/.test(hostname)) {
    return NextResponse.json({ error: 'Dominio inválido.' }, { status: 400, headers: headers() });
  }

  const provider = resolveDomainProvider();
  const result = await authoritativeCheck(hostname, provider);
  return NextResponse.json({ result }, { headers: headers() });
}