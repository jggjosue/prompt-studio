import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';
import { unpublishSite } from '@/lib/publish-site';

export const runtime = 'nodejs';

const headers = () => cacheHeaders('private-no-store');

/** POST /api/page-composer/sites/[id]/unpublish — deja de servir la web pública. */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Inicia sesión.' }, { status: 401, headers: headers() });

  const { id } = await params;
  await unpublishSite(id, userId);
  return NextResponse.json({ unpublished: true }, { headers: headers() });
}