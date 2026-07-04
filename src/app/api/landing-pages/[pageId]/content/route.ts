import { getRawWebPageByCatalogId } from '@/lib/web-pages';
import { pickLocalized } from '@/lib/localized-string';
import { getSiteUrl } from '@/lib/site-url';
import { NextResponse } from 'next/server';

const PAGE_ID_RE = /^wp-\d+$/;

export async function GET(
  request: Request,
  context: { params: Promise<{ pageId: string }> }
) {
  const { pageId } = await context.params;
  if (!PAGE_ID_RE.test(pageId)) {
    return NextResponse.json({ error: 'pageId inválido' }, { status: 400 });
  }

  const raw = getRawWebPageByCatalogId(pageId);
  if (!raw) {
    return NextResponse.json({ error: 'Landing no encontrada' }, { status: 404 });
  }

  const url = new URL(request.url);
  const locale = url.searchParams.get('locale') === 'es' ? 'es' : 'en';
  const includeHtml = url.searchParams.get('html') === '1';

  let html = '';
  if (includeHtml && raw.demoUrl) {
    try {
      const baseUrl = getSiteUrl();
      const res = await fetch(`${baseUrl}/webpages/${raw.demoUrl}/index.html`);
      if (res.ok) {
        html = await res.text();
      }
    } catch (e) {
      console.error('Failed to fetch demo html', e);
    }
  }

  return NextResponse.json({
    pageId,
    locale,
    title: pickLocalized(raw.title, locale),
    description: pickLocalized(raw.description, locale),
    demoUrl: raw.demoUrl,
    html,
  });
}
