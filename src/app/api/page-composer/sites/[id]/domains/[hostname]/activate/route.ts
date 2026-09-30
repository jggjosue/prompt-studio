import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';
import { activateDomain } from '@/lib/custom-domains';

export const runtime = 'nodejs';

const headers = () => cacheHeaders('private-no-store');

/** POST /api/page-composer/sites/[id]/domains/[hostname]/activate — activa solo tras verificar. */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string; hostname: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Inicia sesión.' }, { status: 401, headers: headers() });

  const { id, hostname } = await params;
  try {
    const domain = await activateDomain(id, userId, hostname);
    return NextResponse.json({ domain }, { headers: headers() });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo activar el dominio.';
    return NextResponse.json({ error: message }, { status: message === 'DOMAIN_NOT_FOUND' ? 404 : 422, headers: headers() });
  }
}