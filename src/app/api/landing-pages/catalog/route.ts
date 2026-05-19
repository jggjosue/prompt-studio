import { paginateKeysetCatalog } from '@/lib/catalog-keyset-api';
import { cacheGetOrSet } from '@/lib/server-cache';
import { getRawWebPages } from '@/lib/web-pages';
import { pickLocalized } from '@/lib/localized-string';
import { NextResponse } from 'next/server';

type CatalogItem = {
  id: string;
  title: string;
  demoUrl: string;
  membership: string;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const locale = url.searchParams.get('locale') === 'es' ? 'es' : 'en';
  const after = url.searchParams.get('after');
  const limitParam = url.searchParams.get('limit');
  const limit = limitParam ? Number(limitParam) : undefined;

  const all = await cacheGetOrSet<CatalogItem[]>(
    'catalog',
    `landing-full:${locale}`,
    async () =>
      getRawWebPages().map((page, index) => ({
        id: `wp-${index + 1}`,
        title: pickLocalized(page.title, locale),
        demoUrl: page.demoUrl,
        membership: page.membership,
      }))
  );

  const page = paginateKeysetCatalog(all, item => item.id, { after, limit });

  return NextResponse.json(page, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      'X-Cache-Policy': 'lru',
    },
  });
}
