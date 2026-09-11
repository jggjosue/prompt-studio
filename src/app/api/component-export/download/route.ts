import { createZipArchive } from '@/lib/zip-archive';
import { getServerSubscriptionStatus, hasDownloadPlan } from '@/lib/server-subscription-status';
import { NextResponse } from 'next/server';

const clean = (value: unknown, max: number) => typeof value === 'string' ? value.slice(0, max) : '';
const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60) || 'component';

export async function POST(request: Request) {
  const status = await getServerSubscriptionStatus();
  if (!hasDownloadPlan(status)) return NextResponse.json({ error: 'Se requiere Premium.' }, { status: 403 });
  let raw: Record<string, unknown>;
  try { raw = await request.json() as Record<string, unknown>; } catch { return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 }); }
  const id = slug(clean(raw.id, 80));
  const tsx = clean(raw.tsx, 30_000), css = clean(raw.css, 30_000), registry = clean(raw.registry, 60_000);
  if (!tsx || !css || !registry) return NextResponse.json({ error: 'Archivos incompletos.' }, { status: 400 });
  const zip = createZipArchive([
    { name: `${id}/${id}.tsx`, data: Buffer.from(tsx, 'utf8') },
    { name: `${id}/${id}.css`, data: Buffer.from(css, 'utf8') },
    { name: `${id}/${id}.registry.json`, data: Buffer.from(registry, 'utf8') },
    { name: `${id}/README.md`, data: Buffer.from(`# ${id}\n\nImporta el componente y su CSS en tu proyecto React o Next.js.\n`, 'utf8') },
  ]);
  return new NextResponse(new Uint8Array(zip), { headers: { 'Content-Type': 'application/zip', 'Content-Disposition': `attachment; filename="${id}.zip"`, 'Cache-Control': 'private, no-store' } });
}
