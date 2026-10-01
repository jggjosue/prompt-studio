import { calculateCrowdfundingCredits } from '@/lib/crowdfunding-credit-calculator';
import { cacheHeaders } from '@/lib/cache-policy';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { pledgeAmountCents?: unknown } | null;
  const pledgeAmountCents = typeof body?.pledgeAmountCents === 'number' ? body.pledgeAmountCents : NaN;
  if (!Number.isInteger(pledgeAmountCents) || pledgeAmountCents <= 0) {
    return NextResponse.json({ error: { code: 'PLEDGE_AMOUNT_INVALID' } }, { status: 400, headers: cacheHeaders('public-short') });
  }

  try {
    return NextResponse.json(
      { estimate: calculateCrowdfundingCredits(pledgeAmountCents) },
      { status: 200, headers: cacheHeaders('public-short') },
    );
  } catch {
    return NextResponse.json({ error: { code: 'FOUNDER_TIER_INVALID' } }, { status: 400, headers: cacheHeaders('public-short') });
  }
}
