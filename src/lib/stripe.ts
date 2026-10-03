import Stripe from 'stripe';

let cliente: Stripe | null = null;

function instancia(): Stripe {
  if (cliente) return cliente;
  const apiKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!apiKey) throw new Error('Falta STRIPE_SECRET_KEY: no se puede operar con Stripe.');
  if (!apiKey.startsWith('sk_') && !apiKey.startsWith('rk_')) {
    throw new Error(
      'STRIPE_SECRET_KEY debe ser una clave secreta de Stripe (sk_* o rk_*), no una clave publicable (pk_*).'
    );
  }
  cliente = new Stripe(apiKey, { apiVersion: '2026-04-22.dahlia' });
  return cliente;
}

export const stripe = new Proxy({} as Stripe, {
  get(_destino, propiedad) {
    const real = instancia() as unknown as Record<PropertyKey, unknown>;
    const valor = real[propiedad];
    return typeof valor === 'function' ? valor.bind(real) : valor;
  },
});

export type StripeUserMetadata = {
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripePlan: 'free' | 'premium' | 'creator' | 'pro' | 'studio';
  stripeStatus: 'active' | 'canceled' | 'past_due' | 'trialing' | 'unpaid';
  stripeCurrentPeriodEnd: number;
  stripeBillingCycle: 'monthly' | 'annual';
};

type StripeSubCompat = Stripe.Subscription & { current_period_end: number };

export function extractSubscriptionMeta(
  sub: Stripe.Subscription,
  customerId: string,
  plan: 'free' | 'premium' | 'creator' | 'pro' | 'studio' = 'premium'
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

/**
 * Planes legacy mapeados a sus equivalentes actuales.
 * Se usa para migración de suscriptores existentes.
 */
export const LEGACY_PLAN_MAP: Record<string, 'free' | 'premium' | 'creator' | 'pro' | 'studio'> = {
  basic: 'premium',
  startup: 'studio',
};

export function resolveSubscriptionPlan(sub: Stripe.Subscription): 'premium' | 'creator' | 'pro' | 'studio' {
  const raw = sub.metadata?.plan;
  if (raw === 'premium' || raw === 'creator' || raw === 'pro' || raw === 'studio') return raw;

  const unitAmount = sub.items.data[0]?.price?.unit_amount ?? 0;
  const interval = sub.items.data[0]?.price?.recurring?.interval;
  const amount = interval === 'year' ? unitAmount / 100 : unitAmount / 100;
  if ((interval === 'year' && amount === 90) || (interval !== 'year' && amount === 9)) return 'premium';
  if ((interval === 'year' && amount === 190) || (interval !== 'year' && amount === 19)) return 'creator';
  if ((interval === 'year' && amount === 250) || (interval !== 'year' && amount === 25)) return 'pro';
  if ((interval === 'year' && amount === 390) || (interval !== 'year' && amount === 39)) return 'studio';
  return 'premium';
}
