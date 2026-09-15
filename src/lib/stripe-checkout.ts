export function getPremiumStripeCheckoutUrl(isAnnual: boolean, userId?: string | null): string {
  const base = isAnnual
    ? process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_ANNUAL!
    : process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_MONTHLY!;
  if (!userId) return base;
  return `${base}?client_reference_id=${encodeURIComponent(userId)}`;
}

export function getStartupStripeCheckoutUrl(isAnnual: boolean, userId?: string | null): string {
  const base = isAnnual
    ? process.env.NEXT_PUBLIC_STRIPE_STARTUP_ANNUAL!
    : process.env.NEXT_PUBLIC_STRIPE_STARTUP_MONTHLY!;
  if (!userId) return base;
  return `${base}?client_reference_id=${encodeURIComponent(userId)}`;
}

/**
 * Enlace de pago del tramo `pro`.
 *
 * Devuelve cadena vacía si no está configurado, para que la interfaz pueda
 * ocultar el tramo en lugar de mandar a nadie a un enlace roto. Los otros dos
 * planes usan `!` y confían en que exista; aquí no se puede confiar todavía,
 * porque el precio hay que crearlo en el panel de Stripe.
 */
export function getProStripeCheckoutUrl(isAnnual: boolean, userId?: string | null): string {
  const base = isAnnual
    ? process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL
    : process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY;
  if (!base) return '';
  if (!userId) return base;
  return `${base}?client_reference_id=${encodeURIComponent(userId)}`;
}

/** `true` si el tramo `pro` se puede comprar (hay enlaces de pago). */
export function isProPlanAvailable(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY && process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL
  );
}
