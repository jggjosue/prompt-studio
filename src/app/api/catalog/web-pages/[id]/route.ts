import { NextRequest, NextResponse } from 'next/server';
import { getWebPageById } from '@/lib/web-pages';
import { cacheHeaders } from '@/lib/cache-policy';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const locale = request.nextUrl.searchParams.get('locale') === 'es' ? 'es' : 'en';
  const item = getWebPageById(id, locale);
  if (!item) {
    return NextResponse.json(
      { error: 'Product not found' },
      { status: 404, headers: cacheHeaders('private-no-store') }
    );
  }
  return NextResponse.json(
    { item },
    { headers: cacheHeaders('private-no-store') }
  );
}
