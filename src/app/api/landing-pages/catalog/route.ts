import { getRawWebPages } from '@/lib/web-pages';
import { pickLocalized } from '@/lib/localized-string';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const locale = url.searchParams.get('locale') === 'es' ? 'es' : 'en';

  const items = getRawWebPages().map((page, index) => ({
    id: `wp-${index + 1}`,
    title: pickLocalized(page.title, locale),
    demoUrl: page.demoUrl,
    membership: page.membership,
  }));

  return NextResponse.json({ items });
}
