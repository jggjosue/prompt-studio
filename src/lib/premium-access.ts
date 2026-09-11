export function canAccessPremiumProduct(input: { membership: string; hasSubscription: boolean; hasPurchase: boolean }) {
  return input.membership === 'Free' || input.hasSubscription || input.hasPurchase;
}
