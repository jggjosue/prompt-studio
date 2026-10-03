/**
 * Single commercial catalog for Prompt Studio.
 *
 * Invariant: 1 Prompt Credit has a nominal retail value of $0.01 USD.
 * Monthly subscriptions and active top-ups use that value directly.
 * Annual subscriptions and Founder rewards may discount the effective price,
 * but never below the shared 20% maximum commercial incentive.
 */
export const PROMPT_CREDIT_RETAIL_USD = 0.01;
export const PROMPT_CREDITS_PER_USD = Math.round(1 / PROMPT_CREDIT_RETAIL_USD);
export const MAX_COMMERCIAL_BONUS_PERCENT = 20;
export const MIN_EFFECTIVE_CREDIT_PRICE_USD =
  PROMPT_CREDIT_RETAIL_USD / (1 + MAX_COMMERCIAL_BONUS_PERCENT / 100);

const monthlyCreditsForPrice = (monthlyPriceUsd: number) =>
  Math.round(monthlyPriceUsd * PROMPT_CREDITS_PER_USD);

export const SUBSCRIPTION_CATALOG = {
  premium: { monthlyPriceUsd: 9, annualPriceUsd: 90, monthlyCredits: monthlyCreditsForPrice(9) },
  creator: { monthlyPriceUsd: 19, annualPriceUsd: 190, monthlyCredits: monthlyCreditsForPrice(19) },
  pro: { monthlyPriceUsd: 29, annualPriceUsd: 290, monthlyCredits: monthlyCreditsForPrice(29) },
  studio: { monthlyPriceUsd: 39, annualPriceUsd: 390, monthlyCredits: monthlyCreditsForPrice(39) },
} as const;

export const FOUNDER_BASE_CREDITS_PER_USD = PROMPT_CREDITS_PER_USD;

export const FOUNDER_REWARD_CATALOG = [
  { pledgeAmountCents: 1000, bonusPercent: 5 },
  { pledgeAmountCents: 2500, bonusPercent: 7 },
  { pledgeAmountCents: 5000, bonusPercent: 10 },
  { pledgeAmountCents: 10000, bonusPercent: 12 },
  { pledgeAmountCents: 25000, bonusPercent: 15 },
  { pledgeAmountCents: 50000, bonusPercent: 17 },
  { pledgeAmountCents: 100000, bonusPercent: 20 },
] as const;

const activeTopUp = (priceCents: number, featured = false) => ({
  id: `topup-${priceCents}`,
  credits: Math.round((priceCents / 100) * PROMPT_CREDITS_PER_USD),
  bonusCredits: 0,
  priceCents,
  featured,
});

export const ACTIVE_CREDIT_PACK_CATALOG = [
  activeTopUp(500),
  activeTopUp(1000),
  activeTopUp(2500, true),
  activeTopUp(5000),
  activeTopUp(10000),
] as const;

export type PaidCommercialPlanId = keyof typeof SUBSCRIPTION_CATALOG;
