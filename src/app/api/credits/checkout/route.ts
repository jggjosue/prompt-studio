import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';
import { formatCreditPackPrice, getCreditPack } from '@/lib/credit-packs';
import { rateLimit, RATE_LIMITS, tooManyRequests } from '@/lib/rate-limit';
import { getSiteUrl } from '@/lib/site-url';
import { stripe } from '@/lib/stripe';
import { observeOperation } from '@/lib/observability-server';

/**
 * Abre un checkout embebido de Stripe para recargar créditos.
 *
 * El navegador solo manda el identificador del pack: precio, moneda y créditos
 * salen del catálogo del servidor, nunca del cuerpo de la petición. El webhook
 * vuelve a revalidar el importe contra ese mismo catálogo antes de abonar.
 */
export async function POST(request: Request) {
  const headers = cacheHeaders('private-no-store');
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Inicia sesión para recargar créditos.' }, { status: 401, headers });
  if (process.env.CROWDFUNDING_CREDITS_ACTIVE !== '1') {
    return NextResponse.json(
      { error: 'Las recargas de créditos estarán disponibles cuando termine la campaña de crowdfunding y se active el saldo de IA.' },
      { status: 409, headers },
    );
  }

  const quota = await rateLimit({ key: `credit-topup:${userId}`, ...RATE_LIMITS.expensiveAuthed });
  if (!quota.ok) return tooManyRequests(quota);

  const body = await request.json().catch(() => null) as { packId?: unknown } | null;
  const pack = getCreditPack(body?.packId);
  if (!pack) return NextResponse.json({ error: 'Pack de créditos no encontrado.' }, { status: 404, headers });

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const email = user.primaryEmailAddress?.emailAddress;
  if (!email) return NextResponse.json({ error: 'Tu cuenta necesita un correo principal.' }, { status: 400, headers });

  const publishableKey = process.env.PLAN_PUBLISHABLE_KEY ?? process.env.PLAN_PUBLISHABLE_KEY_DEV;
  if (!publishableKey) return NextResponse.json({ error: 'Stripe no está configurado.' }, { status: 503, headers });

  const siteUrl = getSiteUrl().replace(/\/$/, '');
  const session = await observeOperation(
    { category: 'stripe', name: 'credit_topup_checkout_create', route: '/api/credits/checkout', userId, productId: pack.id, value: pack.priceCents, unit: pack.currency },
    () => stripe.checkout.sessions.create({
      mode: 'payment',
      ui_mode: 'embedded_page',
      customer_email: email,
      client_reference_id: `${userId}___${pack.id}`,
      line_items: [{
        quantity: 1,
        price_data: {
          currency: pack.currency,
          unit_amount: pack.priceCents,
          product_data: {
            name: pack.name.es,
            description: pack.description.es.slice(0, 480),
            metadata: { packId: pack.id, credits: String(pack.credits) },
          },
        },
      }],
      metadata: {
        purchaseType: 'credit_topup',
        purchaserUserId: userId,
        packId: pack.id,
        credits: String(pack.credits),
      },
      payment_intent_data: {
        metadata: { purchaseType: 'credit_topup', purchaserUserId: userId, packId: pack.id },
      },
      return_url: `${siteUrl}/dashboard/credits?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      redirect_on_completion: 'always',
    })
  );

  if (!session.client_secret) return NextResponse.json({ error: 'Stripe no devolvió el secreto de la sesión.' }, { status: 502, headers });

  return NextResponse.json({
    clientSecret: session.client_secret,
    publishableKey,
    sessionId: session.id,
    pack: { id: pack.id, name: pack.name.es, credits: pack.credits, price: formatCreditPackPrice(pack), currency: pack.currency },
  }, { headers });
}
