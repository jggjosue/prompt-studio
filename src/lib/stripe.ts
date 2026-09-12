import Stripe from 'stripe';

/**
 * El cliente se construye en el primer uso, no al importar el módulo.
 *
 * Construirlo arriba rompía el build: `next build` importa cada módulo de ruta
 * para recolectar datos de página, y Stripe lanza «Neither apiKey nor
 * config.authenticator provided» con clave vacía. Un secreto ausente debe
 * fallar en la llamada que lo necesita, no impedir que la aplicación compile.
 */
let cliente: Stripe | null = null;

function instancia(): Stripe {
  if (cliente) return cliente;
  const apiKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!apiKey) throw new Error('Falta STRIPE_SECRET_KEY: no se puede operar con Stripe.');
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
  stripePlan: 'premium' | 'pro' | 'startup';
  stripeStatus: 'active' | 'canceled' | 'past_due' | 'trialing' | 'unpaid';
  stripeCurrentPeriodEnd: number;
  stripeBillingCycle: 'monthly' | 'annual';
};

type StripeSubCompat = Stripe.Subscription & { current_period_end: number };

export function extractSubscriptionMeta(
  sub: Stripe.Subscription,
  customerId: string,
  plan: 'premium' | 'pro' | 'startup' = 'premium'
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
