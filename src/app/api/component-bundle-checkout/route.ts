import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';
import { getComponentProductContent } from '@/lib/component-content-store';
import { getSiteUrl } from '@/lib/site-url';
import { stripe } from '@/lib/stripe';
import { observeOperation } from '@/lib/observability-server';

export async function POST(request: Request) {
  const headers = cacheHeaders('private-no-store');
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Inicia sesión para comprar.' }, { status: 401, headers });
  
  const body = await request.json().catch(() => null) as { productIds?: string[] } | null;
  const productIds = Array.isArray(body?.productIds) ? body.productIds : [];
  
  if (productIds.length === 0) return NextResponse.json({ error: 'No hay productos en el bundle.' }, { status: 400, headers });

  const products: NonNullable<Awaited<ReturnType<typeof getComponentProductContent>>>[] = [];
  for (const id of productIds) {
    const product = await getComponentProductContent(id);
    if (product) products.push(product);
  }
  
  if (products.length === 0) return NextResponse.json({ error: 'Productos no encontrados.' }, { status: 404, headers });

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const email = user.primaryEmailAddress?.emailAddress;
  if (!email) return NextResponse.json({ error: 'Tu cuenta necesita un correo principal.' }, { status: 400, headers });

  const siteUrl = getSiteUrl().replace(/\/$/, '');
  const publishableKey = process.env.PLAN_PUBLISHABLE_KEY ?? process.env.PLAN_PUBLISHABLE_KEY_DEV;
  if (!publishableKey) return NextResponse.json({ error: 'Stripe no está configurado.' }, { status: 503, headers });
  
  const lineItems = products.map(product => ({
    quantity: 1,
    price_data: {
      currency: product.currency,
      unit_amount: Math.round(product.priceCents * 0.8), // 20% discount
      product_data: { 
        name: product.name.es + ' (-20%)', 
        description: product.description.es.slice(0, 480), 
        metadata: { productId: product.id, kind: product.kind } 
      },
    },
  }));

  const session = await observeOperation({ category: 'stripe', name: 'component_bundle_checkout_create', route: '/api/component-bundle-checkout', userId }, () => stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: email,
    client_reference_id: `${userId}___bundle`,
    line_items: lineItems,
    metadata: { purchaseType: 'component_bundle', purchaserUserId: userId, productIds: products.map(p => p.id).join(',') },
    payment_intent_data: { metadata: { purchaseType: 'component_bundle', purchaserUserId: userId } },
    success_url: `${siteUrl}/dashboard/library?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/landing-pages`,
    allow_promotion_codes: false,
  }));

  if (!session.url) return NextResponse.json({ error: 'Stripe no devolvió la url de la sesión.' }, { status: 502, headers });
  return NextResponse.json({ url: session.url }, { headers });
}
