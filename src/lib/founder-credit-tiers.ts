import { validateCreditSaleEconomics } from '@/lib/credit-economics';
import { FOUNDER_BASE_CREDITS_PER_USD, FOUNDER_REWARD_CATALOG } from '@/lib/commercial-pricing';

export { FOUNDER_BASE_CREDITS_PER_USD };

/**
 * Crowdfunding follows the same nominal Prompt Credit price as the rest of the
 * platform: $1 = 100 base credits. Founder value is expressed only as an
 * explicit tier bonus (5%-20%), so there is no hidden alternate conversion.
 *
 * The 20% tier is the commercial floor: $1,000 => 100,000 base + 20,000 bonus
 * = 120,000 credits, or $0.008333 effective per credit. This is the same floor
 * as paying 10 months for 12 months of credits on an annual subscription.
 */
export const FOUNDER_REWARD_TIERS = FOUNDER_REWARD_CATALOG;

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

  if (!validateCreditSaleEconomics({
    priceCents: pledgeAmountCents,
    credits: totalCredits,
    allowPromotionalDiscount: true,
  }).eligible) {
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
