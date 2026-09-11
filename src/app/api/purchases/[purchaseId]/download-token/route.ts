import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';
import connectToDatabase from '@/lib/mongoose';
import ComponentPurchase from '@/models/ComponentPurchase';
import { createPurchaseDownloadToken } from '@/lib/purchase-download-token';

export async function POST(_: Request, context: { params: Promise<{ purchaseId: string }> }) {
  const headers = cacheHeaders('private-no-store');
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers });
  const { purchaseId } = await context.params;
  if (!/^[a-f0-9]{24}$/i.test(purchaseId)) return NextResponse.json({ error: 'Compra no encontrada.' }, { status: 404, headers });
  await connectToDatabase();
  const purchase = await ComponentPurchase.findOne({ _id: purchaseId, purchaserUserId: userId, status: 'paid' }).lean();
  if (!purchase) return NextResponse.json({ error: 'Compra no encontrada.' }, { status: 404, headers });
  if (purchase.downloadCount >= purchase.maxDownloads) return NextResponse.json({ error: 'Alcanzaste el límite de descargas.' }, { status: 429, headers });
  const token = createPurchaseDownloadToken(String(purchase._id), userId);
  return NextResponse.json({ downloadUrl: `/api/purchases/download?token=${encodeURIComponent(token)}`, expiresIn: 600, remaining: purchase.maxDownloads - purchase.downloadCount }, { headers });
}
