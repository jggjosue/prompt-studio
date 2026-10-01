import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { siteAnalytics } from '@/lib/page-analytics';
import { cacheHeaders } from '@/lib/cache-policy';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Inicia sesión.' }, { status: 401 });
  const { id } = await params;
  const query = new URL(request.url).searchParams;
  const to = query.get('to') ? new Date(query.get('to')!) : new Date();
  const from = query.get('from') ? new Date(query.get('from')!) : new Date(Date.now() - 30 * 86400000);
  if (!Number.isFinite(from.getTime()) || !Number.isFinite(to.getTime()) || from > to) return NextResponse.json({ error: 'Rango inválido.' }, { status: 400 });
  try { return NextResponse.json(await siteAnalytics(id, userId, from, to), { headers: cacheHeaders('private-no-store') }); }
  catch { return NextResponse.json({ error: 'Sitio no encontrado.' }, { status: 404 }); }
}
