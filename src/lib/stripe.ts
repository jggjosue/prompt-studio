import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2026-04-22.dahlia',
});

export type StripeUserMetadata = {
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripePlan: 'premium' | 'startup';
  stripeStatus: 'active' | 'canceled' | 'past_due' | 'trialing' | 'unpaid';
  stripeCurrentPeriodEnd: number;
  stripeBillingCycle: 'monthly' | 'annual';
};

type StripeSubCompat = Stripe.Subscription & { current_period_end: number };

export function extractSubscriptionMeta(
  sub: Stripe.Subscription,
  customerId: string,
  plan: 'premium' | 'startup' = 'premium'
): StripeUserMetadata {
  const interval = sub.items.data[0]?.price?.recurring?.interval;
  return {
    stripeCustomerId: customerId,
    stripeSubscriptionId: sub.id,
    stripePlan: plan,
    stripeStatus: sub.status as StripeUserMetadata['stripeStatus'],
    stripeCurrentPeriodEnd: (sub as StripeSubCompat).current_period_end ?? 0,
    stripeBillingCycle: interval === 'year' ? 'annual' : 'monthly',
  };
}
