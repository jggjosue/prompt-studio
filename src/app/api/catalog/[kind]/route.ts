import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { cacheHeaders } from '@/lib/cache-policy';
import { fetchCloudflareStaticAsset } from '@/lib/cloudflare-static-asset';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 24;
const MAX_PAGE_SIZE = 24;

/**
 * Catalog pages are static files under public/. Node (Vercel, local) reads them
 * from disk; Cloudflare Workers has no filesystem, so fall back to the static
 * assets binding.
 */
async function readCatalogFile(kind: string, locale: string, file: string) {
  try {
    return await readFile(path.join(process.cwd(), 'public', 'catalog', kind, locale, file), 'utf8');
  } catch {
    const response = await fetchCloudflareStaticAsset(`/catalog/${kind}/${locale}/${file}`);
    if (!response?.ok) throw new Error(`Catalog asset ${kind}/${locale}/${file} returned ${response?.status ?? 'no assets binding'}`);
    return response.text();
  }
}

function lightItem<T extends { description: string }>(item: T) {
  return { ...item, description: '' };
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ kind: string }> }
) {
  const { kind } = await context.params;
  const locale = request.nextUrl.searchParams.get('locale') === 'es' ? 'es' : 'en';
  const offset = Math.max(0, Number.parseInt(request.nextUrl.searchParams.get('offset') ?? '0', 10) || 0);
  const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, Number.parseInt(request.nextUrl.searchParams.get('limit') ?? String(PAGE_SIZE), 10) || PAGE_SIZE));

  if (!['images', 'videos', 'web-pages'].includes(kind)) return NextResponse.json({ error: 'Unknown catalog' }, { status: 404 });
  const manifest = JSON.parse(await readCatalogFile(kind, locale, 'manifest.json')) as {
    version: string;
    total: number;
    pageSize: number;
    files: Array<{ page: number; file: string; hash: string }>;
  };
  const pageNumber = Math.floor(offset / manifest.pageSize) + 1;
  const pageFile = manifest.files.find(entry => entry.page === pageNumber);
  if (!pageFile) {
    return NextResponse.json(
      { items: [], total: manifest.total, nextOffset: null, version: manifest.version },
      { headers: cacheHeaders('public-catalog') }
    );
  }
  const page = JSON.parse(await readCatalogFile(kind, locale, pageFile.file)) as Array<{ description: string }>;
  const withinPage = offset % manifest.pageSize;
  const items = page.slice(withinPage, withinPage + limit).map(lightItem);
  const nextOffset = offset + items.length;
  const etag = `\"${pageFile.hash}-${withinPage}-${limit}\"`;
  const headers = cacheHeaders('public-catalog', {
    ETag: etag,
    'X-Catalog-Version': manifest.version,
  });
  if (request.headers.get('if-none-match') === etag) {
    return new NextResponse(null, { status: 304, headers });
  }
  return NextResponse.json(
    { items, total: manifest.total, nextOffset: nextOffset < manifest.total ? nextOffset : null, version: manifest.version },
    { headers }
  );
}
