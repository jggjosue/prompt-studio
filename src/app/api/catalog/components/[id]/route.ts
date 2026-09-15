import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';
import { getComponentProductContent } from '@/lib/component-content-store';
import connectToDatabase from '@/lib/mongoose';
import { getServerSubscriptionStatus, hasDownloadPlan } from '@/lib/server-subscription-status';
import ComponentPurchase from '@/models/ComponentPurchase';
import { canAccessPremiumProduct } from '@/lib/premium-access';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const headers = cacheHeaders('private-no-store');
  const { id } = await context.params;
  const product = await getComponentProductContent(id);
  if (!product) return NextResponse.json({ error: 'Producto no encontrado.' }, { status: 404, headers });
  const locale = new URL(request.url).searchParams.get('locale') === 'en' ? 'en' : 'es';
  let allowed = canAccessPremiumProduct({ membership: product.membership, hasSubscription: false, hasPurchase: false });
  const { userId } = await auth();
  if (!allowed && userId) {
    const subscription = await getServerSubscriptionStatus();
    allowed = canAccessPremiumProduct({ membership: product.membership, hasSubscription: hasDownloadPlan(subscription), hasPurchase: false });
    if (!allowed) {
      await connectToDatabase();
      allowed = Boolean(await ComponentPurchase.exists({ purchaserUserId: userId, productId: product.id, status: 'paid' }));
    }
  }
  if (!allowed) return NextResponse.json({ locked: true, product: { id: product.id, name: product.name[locale], membership: product.membership, price: product.priceCents / 100 } }, { status: 403, headers });
  return NextResponse.json({ locked: false, product: { id: product.id, kind: product.kind, name: product.name[locale], description: product.description[locale], prompt: product.prompt[locale], stack: product.stack, tags: product.tags, membership: product.membership, price: product.priceCents / 100 } }, { headers });
}
