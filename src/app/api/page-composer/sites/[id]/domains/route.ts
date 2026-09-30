import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';
import { connectDomain, listDomains } from '@/lib/custom-domains';

export const runtime = 'nodejs';

const headers = () => cacheHeaders('private-no-store');

/** GET /api/page-composer/sites/[id]/domains — dominios del sitio. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Inicia sesión.' }, { status: 401, headers: headers() });

  const { id } = await params;
  const domains = await listDomains(id);
  return NextResponse.json({ domains }, { headers: headers() });
}

/**
 * POST /api/page-composer/sites/[id]/domains — conecta un dominio.
 * Devuelve el registro en `pending` con las instrucciones DNS.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Inicia sesión.' }, { status: 401, headers: headers() });

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as { hostname?: string } | null;
  const hostname = body?.hostname?.trim() ?? '';
  if (!hostname) return NextResponse.json({ error: 'Escribe el dominio.' }, { status: 400, headers: headers() });

  try {
    const domain = await connectDomain({ siteId: id, userId, hostname });
    return NextResponse.json({ domain }, { headers: headers() });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo conectar el dominio.';
    const status = message === 'SITE_NOT_FOUND' ? 404 : message.includes('ya está conectado') ? 409 : 422;
    return NextResponse.json({ error: message }, { status, headers: headers() });
  }
}