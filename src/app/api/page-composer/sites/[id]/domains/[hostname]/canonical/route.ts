import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';
import { setCanonicalDomain } from '@/lib/custom-domains';

export const runtime = 'nodejs';

const headers = () => cacheHeaders('private-no-store');

/** POST — elige el dominio principal solo después de verificación y SSL. */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string; hostname: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Inicia sesión.' }, { status: 401, headers: headers() });

  const { id, hostname } = await params;
  try {
    const domain = await setCanonicalDomain(id, userId, hostname);
    return NextResponse.json({ domain }, { headers: headers() });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo elegir el dominio principal.';
    return NextResponse.json({ error: message }, { status: message === 'SITE_NOT_FOUND' || message === 'DOMAIN_NOT_FOUND' ? 404 : 422, headers: headers() });
  }
}
