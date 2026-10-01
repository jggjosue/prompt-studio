export const FOUNDER_REWARD_TIERS = [
  { pledgeAmountCents: 1000, baseCredits: 1000, bonusPercent: 5 },
  { pledgeAmountCents: 2500, baseCredits: 2500, bonusPercent: 7 },
  { pledgeAmountCents: 5000, baseCredits: 5000, bonusPercent: 10 },
  { pledgeAmountCents: 10000, baseCredits: 10000, bonusPercent: 12 },
  { pledgeAmountCents: 25000, baseCredits: 25000, bonusPercent: 15 },
  { pledgeAmountCents: 50000, baseCredits: 50000, bonusPercent: 17 },
  { pledgeAmountCents: 100000, baseCredits: 100000, bonusPercent: 20 },
] as const;

export function getFounderRewardTier(pledgeAmountCents: number) {
  const tier = FOUNDER_REWARD_TIERS.find((candidate) => candidate.pledgeAmountCents === pledgeAmountCents);
  if (!tier) return null;
  const bonusCredits = Math.floor(tier.baseCredits * tier.bonusPercent / 100);
  return {
    ...tier,
    bonusCredits,
    totalCredits: tier.baseCredits + bonusCredits,
    rewardTier: `founder-${tier.pledgeAmountCents}`,
  };
}
