import { listLandingReadabilityByLocale } from '@/lib/landing-readability-store';
import { cacheGetOrSet } from '@/lib/server-cache';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const locale = url.searchParams.get('locale') === 'es' ? 'es' : 'en';

  const snapshots = await cacheGetOrSet(
    'readability',
    `public-index:${locale}`,
    () => listLandingReadabilityByLocale(locale)
  );

  return NextResponse.json(
    { locale, snapshots },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        'X-Cache-Policy': 'lru',
      },
    }
  );
}
