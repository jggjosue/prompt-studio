import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import AffiliateClick from '@/models/AffiliateClick';
import { registerAffiliateClick } from '@/lib/affiliate-referral';

function safeText(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const referrerUserId = safeText(body?.referrerUserId);
  const productId = safeText(body?.productId);
  const productName = safeText(body?.productName) ?? productId ?? 'product';
  const productPriceCents = typeof body?.productPriceCents === 'number' && Number.isFinite(body.productPriceCents)
    ? Math.max(0, Math.round(body.productPriceCents))
    : null;
  const source = safeText(body?.source) as
    | 'landing-page'
    | 'campaign-card'
    | 'buy-button'
    | 'demo'
    | 'affiliate-program'
    | null;
  const visitorKey = safeText(body?.visitorKey);

  if (!referrerUserId || !productId || !source || !visitorKey) {
    return NextResponse.json({ error: 'Invalid click payload' }, { status: 400 });
  }

  await connectToDatabase();
  const now = new Date();

  const clickResult = await AffiliateClick.updateOne(
    { referrerUserId, visitorKey, productId, source },
    {
      $set: {
        productName,
        productPriceCents,
        updatedAt: now,
      },
      $setOnInsert: {
        referrerUserId,
        clerkUserId: referrerUserId,
        productId,
        source,
        visitorKey,
        createdAt: now,
      },
    },
    { upsert: true }
  );

  if (clickResult.upsertedCount > 0) {
    await registerAffiliateClick({
      clerkUserId: referrerUserId,
      referralCode: referrerUserId,
      productId,
      productName,
      source,
      visitorKey,
      productPriceCents,
    });
  }

  return NextResponse.json({
    received: true,
    counted: clickResult.upsertedCount > 0,
  });
}
