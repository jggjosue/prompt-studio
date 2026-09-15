import { NextRequest, NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';

const publishableKey =
  process.env.PLAN_PUBLISHABLE_KEY || process.env.PLAN_PUBLISHABLE_KEY_DEV;
const useProductionButtons = Boolean(process.env.PLAN_PUBLISHABLE_KEY);

const BUY_BUTTON_IDS: Record<string, string | undefined> = {
  '5': useProductionButtons
    ? process.env.MINI_WEB_PLAN_BUY_BUTTON_ID
    : process.env.MINI_WEB_PLAN_BUY_BUTTON_ID_DEV,
  '10': useProductionButtons
    ? process.env.ENTREPRENEUR_PLAN_BUY_BUTTON_ID
    : process.env.ENTREPRENEUR_PLAN_BUY_BUTTON_ID_DEV,
  '15': useProductionButtons
    ? process.env.PROFESSIONAL_PLAN_BUY_BUTTON_ID
    : process.env.PROFESSIONAL_PLAN_BUY_BUTTON_ID_DEV,
  '20': useProductionButtons
    ? process.env.BUSINESS_PLAN_BUY_BUTTON_ID
    : process.env.BUSINESS_PLAN_BUY_BUTTON_ID_DEV,
  '35': useProductionButtons
    ? process.env.PREMIUM_PLAN_BUY_BUTTON_ID
    : process.env.PREMIUM_PLAN_BUY_BUTTON_ID_DEV,
  '50': useProductionButtons
    ? process.env.ELITE_PLAN_BUY_BUTTON_ID
    : process.env.ELITE_PLAN_BUY_BUTTON_ID_DEV,
};

export async function GET(request: NextRequest) {
  const price = Number(request.nextUrl.searchParams.get('price'));
  const normalizedPrice = Number.isFinite(price) ? String(price) : '';
  const buyButtonId = BUY_BUTTON_IDS[normalizedPrice];

  if (!buyButtonId || !publishableKey) {
    return NextResponse.json(
      { error: 'Stripe buy button is not configured for this price.' },
      { status: 404, headers: cacheHeaders('private-no-store') }
    );
  }

  return NextResponse.json(
    { buyButtonId, publishableKey },
    { headers: cacheHeaders('private-no-store') }
  );
}
