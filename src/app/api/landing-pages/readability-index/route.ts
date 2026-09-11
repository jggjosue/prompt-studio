import { listLandingReadabilityByLocale } from '@/lib/landing-readability-store';
import { cacheGetOrSet } from '@/lib/server-cache';
import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';

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
      headers: cacheHeaders('public-catalog', { 'X-Server-Cache': 'lru' }),
    }
  );
}
