import { listLandingReadabilityByLocale } from '@/lib/landing-readability-store';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const locale = url.searchParams.get('locale') === 'es' ? 'es' : 'en';

  const snapshots = await listLandingReadabilityByLocale(locale);

  return NextResponse.json(
    { locale, snapshots },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    }
  );
}
