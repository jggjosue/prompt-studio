import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';
import { publishSite, PublishError } from '@/lib/publish-site';
import { reserveSubdomain } from '@/lib/tenant-site-resolver';

export const runtime = 'nodejs';

const headers = () => cacheHeaders('private-no-store');

/**
 * POST /api/page-composer/sites/[id]/publish
 *
 * Publica el borrador: valida schema y assets, crea una versión inmutable y
 * apunta el sitio de forma atómica. Un fallo deja la versión anterior online.
 * `body.subdomain` (opcional) reserva el subdominio público antes de publicar.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Inicia sesión.' }, { status: 401, headers: headers() });

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as { subdomain?: string } | null;
  const subdomain = typeof body?.subdomain === 'string' && body.subdomain.trim() ? body.subdomain.trim() : undefined;

  if (subdomain) {
    const error = await reserveSubdomain(id, userId, subdomain);
    if (error) return NextResponse.json({ error, code: 'INVALID_SUBDOMAIN' }, { status: 422, headers: headers() });
  }

  try {
    const result = await publishSite(id, userId);
    return NextResponse.json({ publishedVersion: result.publishedVersion }, { headers: headers() });
  } catch (error) {
    if (error instanceof PublishError) {
      const status = error.code === 'SITE_NOT_FOUND' ? 404 : error.code === 'INVALID_ASSETS' ? 422 : 400;
      return NextResponse.json({ error: error.message, code: error.code }, { status, headers: headers() });
    }
    return NextResponse.json({ error: 'Error interno al publicar.', code: 'INTERNAL' }, { status: 500, headers: headers() });
  }
}