import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';
import { formatComponentPrice } from '@/lib/component-products';
import { getComponentProductContent } from '@/lib/component-content-store';
import { getSiteUrl } from '@/lib/site-url';
import { stripe } from '@/lib/stripe';
import { observeOperation } from '@/lib/observability-server';

export async function POST(request: Request) {
  const headers = cacheHeaders('private-no-store');
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Inicia sesión para comprar este componente.' }, { status: 401, headers });
  const body = await request.json().catch(() => null) as { productId?: unknown } | null;
  const product = await getComponentProductContent(typeof body?.productId === 'string' ? body.productId : '');
  if (!product) return NextResponse.json({ error: 'Producto no encontrado.' }, { status: 404, headers });

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const email = user.primaryEmailAddress?.emailAddress;
  if (!email) return NextResponse.json({ error: 'Tu cuenta necesita un correo principal.' }, { status: 400, headers });

  const siteUrl = getSiteUrl().replace(/\/$/, '');
  const publishableKey = process.env.PLAN_PUBLISHABLE_KEY ?? process.env.PLAN_PUBLISHABLE_KEY_DEV;
  if (!publishableKey) return NextResponse.json({ error: 'Stripe no está configurado.' }, { status: 503, headers });
  const session = await observeOperation({ category: 'stripe', name: 'component_checkout_create', route: '/api/component-checkout', userId, productId: product.id, value: product.priceCents, unit: product.currency }, () => stripe.checkout.sessions.create({
    mode: 'payment',
    ui_mode: 'embedded_page',
    customer_email: email,
    client_reference_id: `${userId}___${product.id}`,
    line_items: [{
      quantity: 1,
      price_data: {
        currency: product.currency,
        unit_amount: product.priceCents,
        product_data: { name: product.name.es, description: product.description.es.slice(0, 480), metadata: { productId: product.id, kind: product.kind } },
      },
    }],
    metadata: { purchaseType: 'component', purchaserUserId: userId, productId: product.id, productName: product.name.es, productKind: product.kind },
    payment_intent_data: { metadata: { purchaseType: 'component', purchaserUserId: userId, productId: product.id } },
    return_url: `${siteUrl}/dashboard/library?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    redirect_on_completion: 'always',
    allow_promotion_codes: true,
  }));

  if (!session.client_secret) return NextResponse.json({ error: 'Stripe no devolvió el secreto de la sesión.' }, { status: 502, headers });
  return NextResponse.json({ clientSecret: session.client_secret, publishableKey, sessionId: session.id, product: { id: product.id, name: product.name.es, kind: product.kind, price: formatComponentPrice(product), currency: product.currency } }, { headers });
}
