const FALLBACK_STRIPE_URLS = {
  creator: {
    monthly: 'https://buy.stripe.com/creator-monthly',
    annual: 'https://buy.stripe.com/creator-annual',
  },
  pro: {
    monthly: 'https://buy.stripe.com/pro-monthly',
    annual: 'https://buy.stripe.com/pro-annual',
  },
  studio: {
    monthly: 'https://buy.stripe.com/studio-monthly',
    annual: 'https://buy.stripe.com/studio-annual',
  },
};

export function getCreatorStripeCheckoutUrl(isAnnual: boolean, userId?: string | null): string {
  const base = isAnnual
    ? process.env.NEXT_PUBLIC_STRIPE_CREATOR_ANNUAL || process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_ANNUAL
    : process.env.NEXT_PUBLIC_STRIPE_CREATOR_MONTHLY || process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_MONTHLY;
  if (!base) return '';
  if (!userId) return base;
  return `${base}${base.includes('?') ? '&' : '?'}client_reference_id=${encodeURIComponent(userId)}`;
}

export function getProStripeCheckoutUrl(isAnnual: boolean, userId?: string | null): string {
  const base =
    (isAnnual
      ? process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL || process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_ANNUAL
      : process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY || process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_MONTHLY) ||
    FALLBACK_STRIPE_URLS.pro[isAnnual ? 'annual' : 'monthly'];
  if (!userId) return base;
  return `${base}${base.includes('?') ? '&' : '?'}client_reference_id=${encodeURIComponent(userId)}`;
}

export function getStudioStripeCheckoutUrl(isAnnual: boolean, userId?: string | null): string {
  const base =
    (isAnnual
      ? process.env.NEXT_PUBLIC_STRIPE_STUDIO_ANNUAL || process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_ANNUAL
      : process.env.NEXT_PUBLIC_STRIPE_STUDIO_MONTHLY || process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_MONTHLY) ||
    FALLBACK_STRIPE_URLS.studio[isAnnual ? 'annual' : 'monthly'];
  if (!userId) return base;
  return `${base}${base.includes('?') ? '&' : '?'}client_reference_id=${encodeURIComponent(userId)}`;
}

export function getCreatorStripeCheckoutUrlLegacy(isAnnual: boolean, userId?: string | null): string {
  const base = isAnnual
    ? process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_ANNUAL
    : process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_MONTHLY;
  if (!base) return FALLBACK_STRIPE_URLS.creator[isAnnual ? 'annual' : 'monthly'];
  if (!userId) return base;
  return `${base}${base.includes('?') ? '&' : '?'}client_reference_id=${encodeURIComponent(userId)}`;
}

/** `true` si el tramo `creator` se puede comprar. */
export function isCreatorPlanAvailable(): boolean {
  return true;
}

/** `true` si el tramo `pro` se puede comprar. */
export function isProPlanAvailable(): boolean {
  return true;
}

/** `true` si el tramo `studio` se puede comprar. */
export function isStudioPlanAvailable(): boolean {
  return true;
}

/**
 * Devuelve la URL de checkout para un plan.
 * Retorna cadena vacía si no está configurado.
 */
export function getPlanCheckoutUrl(plan: 'creator' | 'pro' | 'studio', isAnnual: boolean, userId?: string | null): string {
  switch (plan) {
    case 'creator': return getCreatorStripeCheckoutUrl(isAnnual, userId);
    case 'pro': return getProStripeCheckoutUrl(isAnnual, userId);
    case 'studio': return getStudioStripeCheckoutUrl(isAnnual, userId);
  }
}

/**
 * Verifica si un plan está disponible para compra.
 */
export function isPlanAvailable(plan: 'creator' | 'pro' | 'studio'): boolean {
  switch (plan) {
    case 'creator': return isCreatorPlanAvailable();
    case 'pro': return isProPlanAvailable();
    case 'studio': return isStudioPlanAvailable();
  }
}

/**
 * Obtiene el precio de un plan desde la configuración centralizada.
 */
export function getPlanPriceFromConfig(plan: 'creator' | 'pro' | 'studio', isAnnual: boolean): number {
  switch (plan) {
    case 'creator': return isAnnual ? 90 : 9;
    case 'pro': return isAnnual ? 250 : 25;
    case 'studio': return isAnnual ? 390 : 39;
  }
}
