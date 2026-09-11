import { getWebPageCheckoutUrl } from '@/lib/web-page-checkout';
import { NextRequest, NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';

const FORWARDED_PARAMS = [
  'client_reference_id',
  'affiliate_product_id',
  'affiliate_ref',
  'affiliate_first_ref',
  'affiliate_last_touch_ref',
] as const;

export function GET(request: NextRequest) {
  const price = request.nextUrl.searchParams.get('price') ?? undefined;
  const checkoutUrl = getWebPageCheckoutUrl(price);

  if (!checkoutUrl) {
    return NextResponse.json(
      { error: 'Checkout no configurado para este precio.' },
      { status: 503, headers: cacheHeaders('private-no-store') }
    );
  }

  const destination = new URL(checkoutUrl);
  for (const key of FORWARDED_PARAMS) {
    const value = request.nextUrl.searchParams.get(key);
    if (value) destination.searchParams.set(key, value);
  }

  return NextResponse.redirect(destination, {
    headers: cacheHeaders('private-no-store'),
  });
}
