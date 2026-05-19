import { getRawWebPageByCatalogId } from '@/lib/web-pages';
import { pickLocalized } from '@/lib/localized-string';
import { readLocalDemoBundle } from '@/lib/refactory-bundle';
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
    const bundle = readLocalDemoBundle(raw.demoUrl);
    html = bundle?.html ?? '';
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
