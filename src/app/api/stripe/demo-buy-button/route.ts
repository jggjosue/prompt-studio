import { NextRequest, NextResponse } from 'next/server';

const BUY_BUTTON_IDS: Record<string, string | undefined> = {
  '5': process.env.MINI_WEB_PLAN_BUY_BUTTON_ID,
  '10': process.env.ENTREPRENEUR_PLAN_BUY_BUTTON_ID,
  '15': process.env.PROFESSIONAL_PLAN_BUY_BUTTON_ID,
  '20': process.env.BUSINESS_PLAN_BUY_BUTTON_ID,
  '35': process.env.PREMIUM_PLAN_BUY_BUTTON_ID,
  '50': process.env.ELITE_PLAN_BUY_BUTTON_ID,
};

export async function GET(request: NextRequest) {
  const price = Number(request.nextUrl.searchParams.get('price'));
  const normalizedPrice = Number.isFinite(price) ? String(price) : '';
  const buyButtonId = BUY_BUTTON_IDS[normalizedPrice];
  const publishableKey = process.env.PLAN_PUBLISHABLE_KEY;

  if (!buyButtonId || !publishableKey) {
    return NextResponse.json(
      { error: 'Stripe buy button is not configured for this price.' },
      { status: 404 }
    );
  }

  return NextResponse.json(
    { buyButtonId, publishableKey },
    { headers: { 'Cache-Control': 'public, max-age=300, s-maxage=300' } }
  );
}
