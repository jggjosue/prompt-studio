/**
 * Single commercial catalog for Prompt Studio.
 *
 * Public prices, included credits, Founder reward tiers and active top-ups
 * originate here. UI surfaces and checkout helpers must consume this catalog
 * instead of duplicating numeric price/credit tables.
 */
export const SUBSCRIPTION_CATALOG = {
  premium: { monthlyPriceUsd: 9, annualPriceUsd: 90, monthlyCredits: 500 },
  creator: { monthlyPriceUsd: 19, annualPriceUsd: 190, monthlyCredits: 1000 },
  pro: { monthlyPriceUsd: 29, annualPriceUsd: 290, monthlyCredits: 1500 },
  studio: { monthlyPriceUsd: 39, annualPriceUsd: 390, monthlyCredits: 3000 },
} as const;

export const FOUNDER_BASE_CREDITS_PER_USD = 80;

export const FOUNDER_REWARD_CATALOG = [
  { pledgeAmountCents: 1000, bonusPercent: 5 },
  { pledgeAmountCents: 2500, bonusPercent: 7 },
  { pledgeAmountCents: 5000, bonusPercent: 10 },
  { pledgeAmountCents: 10000, bonusPercent: 12 },
  { pledgeAmountCents: 25000, bonusPercent: 15 },
  { pledgeAmountCents: 50000, bonusPercent: 17 },
  { pledgeAmountCents: 100000, bonusPercent: 20 },
] as const;

export const ACTIVE_CREDIT_PACK_CATALOG = [
  { id: 'topup-500', credits: 500, bonusCredits: 0, priceCents: 500, featured: false },
  { id: 'topup-1000', credits: 1000, bonusCredits: 0, priceCents: 1000, featured: false },
  { id: 'topup-2500', credits: 2500, bonusCredits: 0, priceCents: 2500, featured: true },
  { id: 'topup-5000', credits: 5000, bonusCredits: 0, priceCents: 5000, featured: false },
  { id: 'topup-10000', credits: 10000, bonusCredits: 0, priceCents: 10000, featured: false },
] as const;

export type PaidCommercialPlanId = keyof typeof SUBSCRIPTION_CATALOG;
