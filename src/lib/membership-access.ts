export type ContentMembership = 'free' | 'premium' | 'startup';

export function normalizeMembership(membership?: string): ContentMembership {
  const value = (membership ?? 'Free').trim().toLowerCase();
  if (value === 'startup' || value === 'developer') return 'startup';
  if (value === 'premium') return 'premium';
  return 'free';
}

export function membershipRequiresPayment(membership?: string): boolean {
  const tier = normalizeMembership(membership);
  return tier === 'premium' || tier === 'startup';
}

export const SIGN_UP_PATH = '/sign-up';
export const CHECKOUT_PATH = '/prices';

export function buildSignUpUrl(returnAfterPayment = CHECKOUT_PATH): string {
  return `${SIGN_UP_PATH}?redirect_url=${encodeURIComponent(returnAfterPayment)}`;
}

export function buildCheckoutUrl(options?: { plan?: ContentMembership }): string {
  if (!options?.plan || options.plan === 'free') return CHECKOUT_PATH;
  return `${CHECKOUT_PATH}?plan=${options.plan}`;
}
