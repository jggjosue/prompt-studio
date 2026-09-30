import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';
import { getSitePublication } from '@/lib/publish-site';

export const runtime = 'nodejs';

const headers = () => cacheHeaders('private-no-store');

/** GET /api/page-composer/sites/[id]/publication — estado de publicación. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Inicia sesión.' }, { status: 401, headers: headers() });

  const { id } = await params;
  const publication = await getSitePublication(id, userId);
  if (!publication) return NextResponse.json({ error: 'Sitio no encontrado.' }, { status: 404, headers: headers() });
  return NextResponse.json(publication, { headers: headers() });
}