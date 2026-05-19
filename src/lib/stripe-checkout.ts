export function getPremiumStripeCheckoutUrl(isAnnual: boolean, userId?: string | null): string {
  const base = isAnnual
    ? process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_ANNUAL!
    : process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_MONTHLY!;
  if (!userId) return base;
  return `${base}?client_reference_id=${encodeURIComponent(userId)}`;
}
