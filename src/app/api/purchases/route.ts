import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';
import connectToDatabase from '@/lib/mongoose';
import ComponentPurchase from '@/models/ComponentPurchase';

export async function GET() {
  const headers = cacheHeaders('private-user');
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers });
  await connectToDatabase();
  const purchases = await ComponentPurchase.find({ purchaserUserId: userId, status: 'paid' }).sort({ purchasedAt: -1 }).lean();
  return NextResponse.json({ purchases: purchases.map(purchase => ({ id: String(purchase._id), productId: purchase.productId, productName: purchase.productName, productKind: purchase.productKind, price: purchase.amountPaidCents / 100, currency: purchase.currency, receiptUrl: purchase.receiptUrl ?? null, downloadCount: purchase.downloadCount, maxDownloads: purchase.maxDownloads, purchasedAt: purchase.purchasedAt })) }, { headers });
}
