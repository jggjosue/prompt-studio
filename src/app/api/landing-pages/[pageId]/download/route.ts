import {
  getServerSubscriptionStatus,
  hasDownloadPlan,
} from '@/lib/server-subscription-status';
import { normalizeDemoFolder } from '@/lib/refactory-online';
import {
  getRawWebPageByCatalogId,
  getRawWebPageByDemoSlug,
  getRawWebPageById,
} from '@/lib/web-pages';
import { createWebPageZip } from '@/lib/web-page-download';
import { verifyGuestDownloadToken } from '@/lib/guest-download-token';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  context: { params: Promise<{ pageId: string }> }
) {
  const { pageId } = await context.params;
  const page =
    getRawWebPageById(pageId) ??
    getRawWebPageByCatalogId(pageId) ??
    getRawWebPageByDemoSlug(pageId);
  const folder = page ? normalizeDemoFolder(page.demoUrl ?? '') : null;
  if (!page || !folder) {
    return NextResponse.json(
      { error: 'No se encontró la carpeta de esta página.' },
      { status: 404 }
    );
  }

  const isFree = page.membership?.trim().toLowerCase() === 'free';
  const token = new URL(request.url).searchParams.get('token');
  const hasGuestAccess = token
    ? verifyGuestDownloadToken(token, pageId)
    : false;
  const subscription = hasGuestAccess
    ? null
    : await getServerSubscriptionStatus();
  
  const canDownload = 
    isFree || 
    hasGuestAccess ||
    (subscription !== null &&
      (hasDownloadPlan(subscription) ||
        subscription.purchasedPages.includes(pageId) ||
        (page.id ? subscription.purchasedPages.includes(page.id) : false)));

  if (!canDownload) {
    return NextResponse.json(
      { error: 'Se requiere una suscripción Premium activa o haber comprado este artículo.' },
      { status: 403 }
    );
  }

  try {
    const archive = await createWebPageZip(folder, page.stack ?? []);
    if (!archive) {
      return NextResponse.json(
        { error: 'La carpeta de esta página no está disponible.' },
        { status: 404 }
      );
    }

    return new Response(archive as unknown as BodyInit, {
      headers: {
        'Cache-Control': 'private, no-store',
        'Content-Disposition': `attachment; filename="${folder}.zip"`,
        'Content-Length': String(archive.length),
        'Content-Type': 'application/zip',
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'No se pudo crear la descarga.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
