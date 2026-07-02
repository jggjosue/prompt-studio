import { stripe, extractSubscriptionMeta } from '@/lib/stripe';
import type { StripeUserMetadata } from '@/lib/stripe';
import { auth, clerkClient } from '@clerk/nextjs/server';
import type Stripe from 'stripe';

export type ServerSubscriptionStatus = {
  plan: 'free' | 'premium' | 'startup';
  status: StripeUserMetadata['stripeStatus'] | null;
  currentPeriodEnd: number | null;
  billingCycle: 'monthly' | 'annual' | null;
  purchasedPages: string[];
};

const FREE: ServerSubscriptionStatus = {
  plan: 'free',
  status: null,
  currentPeriodEnd: null,
  billingCycle: null,
  purchasedPages: [],
};

const DEV_PREMIUM: ServerSubscriptionStatus = {
  plan: 'premium',
  status: 'active',
  currentPeriodEnd: null,
  billingCycle: 'monthly',
  purchasedPages: [],
};

const DEV_STARTUP: ServerSubscriptionStatus = {
  plan: 'startup',
  status: 'active',
  currentPeriodEnd: null,
  billingCycle: 'monthly',
  purchasedPages: [],
};

const ACTIVE_STATUSES: StripeUserMetadata['stripeStatus'][] = [
  'active',
  'trialing',
];

function toStatus(meta: StripeUserMetadata, purchasedPages: string[] = []): ServerSubscriptionStatus {
  const isActive = ACTIVE_STATUSES.includes(meta.stripeStatus);
  return {
    plan: isActive ? meta.stripePlan : 'free',
    status: meta.stripeStatus,
    currentPeriodEnd: meta.stripeCurrentPeriodEnd ?? null,
    billingCycle: isActive ? (meta.stripeBillingCycle ?? null) : null,
    purchasedPages,
  };
}

export async function getServerSubscriptionStatus(): Promise<ServerSubscriptionStatus> {
  const { userId } = await auth();
  if (!userId) return FREE;

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const meta = user.privateMetadata as Partial<StripeUserMetadata> & { purchasedPages?: string[] };
  const userEmail = user.emailAddresses[0]?.emailAddress?.trim().toLowerCase();
  const premiumJoEmail = process.env.PROMPT_STUDIO_PREMIUM_JO
    ?.trim()
    .toLowerCase();
  const startupJoEmail = process.env.PROMPT_STUDIO_STARTUP_JO
    ?.trim()
    .toLowerCase();
  const purchasedPages = Array.isArray(meta.purchasedPages) ? meta.purchasedPages : [];

  if (premiumJoEmail && userEmail === premiumJoEmail) {
    return { ...DEV_PREMIUM, purchasedPages };
  }

  if (startupJoEmail && userEmail === startupJoEmail) {
    return { ...DEV_STARTUP, purchasedPages };
  }

  if (meta.stripeCustomerId) {
    const { data: subscriptions } = await stripe.subscriptions.list({
      customer: meta.stripeCustomerId,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.length === 0) return { ...FREE, purchasedPages };

    return toStatus(
      extractSubscriptionMeta(
        subscriptions[0],
        meta.stripeCustomerId,
        meta.stripePlan ?? 'premium'
      ),
      purchasedPages
    );
  }

  if (!userEmail) return { ...FREE, purchasedPages };

  const { data: customers } = await stripe.customers.list({
    email: userEmail,
    limit: 5,
  });

  for (const customer of customers) {
    const { data: subscriptions } = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.length === 0) continue;

    const freshMeta = extractSubscriptionMeta(
      subscriptions[0] as Stripe.Subscription,
      customer.id,
      'premium'
    );

    await client.users.updateUserMetadata(userId, {
      privateMetadata: { ...meta, ...freshMeta },
    });

    if (!customer.metadata?.clerkUserId) {
      await stripe.customers.update(customer.id, {
        metadata: { clerkUserId: userId },
      });
    }

    return toStatus(freshMeta, purchasedPages);
  }

  return { ...FREE, purchasedPages };
}

export function hasDownloadPlan(status: ServerSubscriptionStatus): boolean {
  return status.plan === 'premium' || status.plan === 'startup';
}
