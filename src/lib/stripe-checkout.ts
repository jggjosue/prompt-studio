type PaidPlanId = 'premium' | 'creator' | 'pro' | 'studio';

function withClientReference(base: string, userId?: string | null): string {
  if (!base || !userId) return base;
  return `${base}${base.includes('?') ? '&' : '?'}client_reference_id=${encodeURIComponent(userId)}`;
}

export function getPremiumStripeCheckoutUrl(isAnnual: boolean, userId?: string | null): string {
  const base = isAnnual
    ? process.env.NEXT_PUBLIC_STRIPE_PREMIUM_ANNUAL || process.env.NEXT_PUBLIC_STRIPE_CREATOR_ANNUAL || process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_ANNUAL
    : process.env.NEXT_PUBLIC_STRIPE_PREMIUM_MONTHLY || process.env.NEXT_PUBLIC_STRIPE_CREATOR_MONTHLY || process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_MONTHLY;
  return withClientReference(base ?? '', userId);
}

export function getCreatorStripeCheckoutUrl(isAnnual: boolean, userId?: string | null): string {
  const base = isAnnual
    ? process.env.NEXT_PUBLIC_STRIPE_CREATOR_PLUS_ANNUAL
    : process.env.NEXT_PUBLIC_STRIPE_CREATOR_PLUS_MONTHLY;
  return withClientReference(base ?? '', userId);
}

export function getProStripeCheckoutUrl(isAnnual: boolean, userId?: string | null): string {
  const base = isAnnual ? process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL : process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY;
  return withClientReference(base ?? '', userId);
}

export function getStudioStripeCheckoutUrl(isAnnual: boolean, userId?: string | null): string {
  const base = isAnnual ? process.env.NEXT_PUBLIC_STRIPE_STUDIO_ANNUAL : process.env.NEXT_PUBLIC_STRIPE_STUDIO_MONTHLY;
  return withClientReference(base ?? '', userId);
}

export function getCreatorStripeCheckoutUrlLegacy(isAnnual: boolean, userId?: string | null): string {
  return getPremiumStripeCheckoutUrl(isAnnual, userId);
}

export function getPlanCheckoutUrl(plan: PaidPlanId, isAnnual: boolean, userId?: string | null): string {
  switch (plan) {
    case 'premium': return getPremiumStripeCheckoutUrl(isAnnual, userId);
    case 'creator': return getCreatorStripeCheckoutUrl(isAnnual, userId);
    case 'pro': return getProStripeCheckoutUrl(isAnnual, userId);
    case 'studio': return getStudioStripeCheckoutUrl(isAnnual, userId);
  }
}

export function isPlanAvailable(plan: PaidPlanId, isAnnual = false): boolean {
  return Boolean(getPlanCheckoutUrl(plan, isAnnual));
}

export function isPremiumPlanAvailable(isAnnual = false): boolean {
  return isPlanAvailable('premium', isAnnual);
}

export function isCreatorPlanAvailable(isAnnual = false): boolean {
  return isPlanAvailable('creator', isAnnual);
}

export function isProPlanAvailable(isAnnual = false): boolean {
  return isPlanAvailable('pro', isAnnual);
}

export function isStudioPlanAvailable(isAnnual = false): boolean {
  return isPlanAvailable('studio', isAnnual);
}

export function getPlanPriceFromConfig(plan: PaidPlanId, isAnnual: boolean): number {
  const prices = {
    premium: { monthly: 9, annual: 90 },
    creator: { monthly: 19, annual: 190 },
    pro: { monthly: 25, annual: 250 },
    studio: { monthly: 39, annual: 390 },
  } as const;
  return prices[plan][isAnnual ? 'annual' : 'monthly'];
}
