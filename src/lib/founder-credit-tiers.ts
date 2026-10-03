import { validateCreditSaleEconomics } from '@/lib/credit-economics';

export const FOUNDER_BASE_CREDITS_PER_USD = 80;

export const FOUNDER_REWARD_TIERS = [
  { pledgeAmountCents: 1000, bonusPercent: 5 },
  { pledgeAmountCents: 2500, bonusPercent: 7 },
  { pledgeAmountCents: 5000, bonusPercent: 10 },
  { pledgeAmountCents: 10000, bonusPercent: 12 },
  { pledgeAmountCents: 25000, bonusPercent: 15 },
  { pledgeAmountCents: 50000, bonusPercent: 17 },
  { pledgeAmountCents: 100000, bonusPercent: 20 },
] as const;

export const MIN_FOUNDER_PLEDGE_CENTS = 1000;
export const MAX_FOUNDER_PLEDGE_CENTS = 1_000_000;

export function getFounderRewardTier(pledgeAmountCents: number) {
  if (!Number.isInteger(pledgeAmountCents) || pledgeAmountCents < MIN_FOUNDER_PLEDGE_CENTS || pledgeAmountCents > MAX_FOUNDER_PLEDGE_CENTS) {
    return null;
  }

  const matched = [...FOUNDER_REWARD_TIERS]
    .reverse()
    .find((candidate) => pledgeAmountCents >= candidate.pledgeAmountCents);

  if (!matched) return null;

  const baseCredits = Math.floor((pledgeAmountCents / 100) * FOUNDER_BASE_CREDITS_PER_USD);
  const bonusCredits = Math.floor(baseCredits * matched.bonusPercent / 100);
  const totalCredits = baseCredits + bonusCredits;
  if (!validateCreditSaleEconomics({ priceCents: pledgeAmountCents, credits: totalCredits }).eligible) {
    return null;
  }
  return {
    pledgeAmountCents,
    baseCredits,
    bonusPercent: matched.bonusPercent,
    bonusCredits,
    totalCredits,
    rewardTier: `founder-${matched.pledgeAmountCents}-plus`,
  };
}
