import { stripe, extractSubscriptionMeta } from '@/lib/stripe';
import type { StripeUserMetadata } from '@/lib/stripe';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type Stripe from 'stripe';

export type SubscriptionStatusResponse = {
  plan: 'free' | 'premium' | 'startup';
  status: StripeUserMetadata['stripeStatus'] | null;
  currentPeriodEnd: number | null;
  billingCycle: 'monthly' | 'annual' | null;
};

const FREE: SubscriptionStatusResponse = {
  plan: 'free',
  status: null,
  currentPeriodEnd: null,
  billingCycle: null,
};

const ACTIVE_STATUSES: StripeUserMetadata['stripeStatus'][] = ['active', 'trialing'];

function toResponse(meta: StripeUserMetadata): SubscriptionStatusResponse {
  const isActive = ACTIVE_STATUSES.includes(meta.stripeStatus);
  return {
    plan: isActive ? meta.stripePlan : 'free',
    status: meta.stripeStatus,
    currentPeriodEnd: meta.stripeCurrentPeriodEnd ?? null,
    billingCycle: isActive ? (meta.stripeBillingCycle ?? null) : null,
  };
}

function jsonResponse(body: SubscriptionStatusResponse) {
  return NextResponse.json(body, {
    headers: {
      'Cache-Control': 'private, no-store',
    },
  });
}

const DEV_PREMIUM: SubscriptionStatusResponse = {
  plan: 'premium',
  status: 'active',
  currentPeriodEnd: null,
  billingCycle: 'monthly',
};

export async function GET() {
  const { userId } = await auth();
  if (!userId) return jsonResponse(FREE);

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const meta = user.privateMetadata as Partial<StripeUserMetadata>;

  const devCred = process.env.DEV_CRED_JO;
  const userEmail = user.emailAddresses[0]?.emailAddress;
  if (devCred && userEmail === devCred) return jsonResponse(DEV_PREMIUM);

  // Fast path — ya tenemos el customer ID almacenado desde el webhook
  if (meta.stripeCustomerId) {
    const { data: subs } = await stripe.subscriptions.list({
      customer: meta.stripeCustomerId,
      status: 'active',
      limit: 1,
    });

    if (subs.length === 0) return jsonResponse(FREE);

    const fresh = extractSubscriptionMeta(subs[0], meta.stripeCustomerId, meta.stripePlan ?? 'premium');
    return jsonResponse(toResponse(fresh));
  }

  // Slow path — buscar por email del usuario en Stripe
  const email = user.emailAddresses[0]?.emailAddress;
  if (!email) return jsonResponse(FREE);

  const { data: customers } = await stripe.customers.list({ email, limit: 5 });
  if (customers.length === 0) return jsonResponse(FREE);

  for (const customer of customers) {
    const { data: subs } = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 1,
    });

    if (subs.length === 0) continue;

    const sub = subs[0] as Stripe.Subscription;
    const freshMeta = extractSubscriptionMeta(sub, customer.id, 'premium');

    // Guardar en Clerk para que las próximas llamadas usen el fast path
    await client.users.updateUserMetadata(userId, { privateMetadata: freshMeta });

    // Taggear el customer en Stripe con el clerkUserId para que el webhook funcione
    if (!customer.metadata?.clerkUserId) {
      await stripe.customers.update(customer.id, { metadata: { clerkUserId: userId } });
    }

    return jsonResponse(toResponse(freshMeta));
  }

  return jsonResponse(FREE);
}
