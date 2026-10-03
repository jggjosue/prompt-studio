import 'server-only';

import { grantFounderCredits } from '@/lib/ai-job-service';
import { getFounderRewardTier } from '@/lib/founder-credit-tiers';
import connectToDatabase from '@/lib/mongoose';
import FounderCreditClaim from '@/models/FounderCreditClaim';
import CrowdfundingBacker from '@/models/CrowdfundingBacker';

export async function registerEligibleFounderBacker(input: {
  campaignId: string;
  backerEmail: string;
  pledgeAmountCents: number;
  currency: string;
  campaignEnded: boolean;
  fundsReceived: boolean;
  backerVerified: boolean;
  metadata?: Record<string, unknown>;
  backerNumber?: number;
}) {
  if (!input.campaignId.trim() || input.campaignId.length > 120) throw new Error('FOUNDER_CAMPAIGN_INVALID');
  const email = input.backerEmail.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320) throw new Error('FOUNDER_EMAIL_INVALID');
  if (!input.campaignEnded || !input.fundsReceived || !input.backerVerified) throw new Error('FOUNDER_NOT_ELIGIBLE');
  if (input.currency.toUpperCase() !== 'USD') throw new Error('FOUNDER_CURRENCY_UNSUPPORTED');
  await connectToDatabase();

  if (input.backerNumber) {
    const backer = await CrowdfundingBacker.findOne({
      campaignId: input.campaignId.trim(),
      backerNumber: input.backerNumber,
      purchaserEmail: email,
    });
    if (!backer || backer.totalCredits <= 0) throw new Error('FOUNDER_BACKER_NOT_FOUND');

    const claim = await FounderCreditClaim.findOneAndUpdate(
      { campaignId: input.campaignId.trim(), backerEmail: email },
      {
        $set: {
          backerId: backer._id,
          backerNumber: backer.backerNumber,
          pledgeAmountCents: backer.totalContributedCents,
          currency: 'USD',
          rewardTier: `founder-backer-${backer.backerNumber}`,
          baseCredits: backer.totalBaseCredits,
          bonusCredits: backer.totalBonusCredits,
          totalCredits: backer.totalCredits,
          status: 'eligible',
          metadata: {
            ...input.metadata,
            campaignEnded: true,
            fundsReceived: true,
            backerVerified: true,
            contributionCount: backer.contributionCount,
          },
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true, returnDocument: 'after' },
    );

    await CrowdfundingBacker.updateOne(
      { _id: backer._id },
      { $set: { founderClaimId: claim._id, creditStatus: 'eligible', updatedAt: new Date() } },
    );
    return claim;
  }

  const tier = getFounderRewardTier(input.pledgeAmountCents);
  if (!tier) throw new Error('FOUNDER_TIER_INVALID');

  return FounderCreditClaim.findOneAndUpdate(
    { campaignId: input.campaignId.trim(), backerEmail: email },
    { $setOnInsert: {
      pledgeAmountCents: input.pledgeAmountCents,
      currency: 'USD',
      rewardTier: tier.rewardTier,
      baseCredits: tier.baseCredits,
      bonusCredits: tier.bonusCredits,
      totalCredits: tier.totalCredits,
      status: 'eligible',
      metadata: { ...input.metadata, campaignEnded: true, fundsReceived: true, backerVerified: true },
      createdAt: new Date(),
    }, $set: { updatedAt: new Date() } },
    { upsert: true, returnDocument: 'after' },
  );
}

export async function claimFounderCredits(input: { campaignId: string; backerEmail: string; userId: string }) {
  if (!input.userId || !input.campaignId.trim()) throw new Error('FOUNDER_CLAIM_INVALID');
  await connectToDatabase();
  const email = input.backerEmail.trim().toLowerCase();
  const claim = await FounderCreditClaim.findOne({ campaignId: input.campaignId, backerEmail: email });
  if (!claim) throw new Error('FOUNDER_CLAIM_NOT_FOUND');
  if (claim.status === 'claimed') {
    if (claim.userId !== input.userId) throw new Error('FOUNDER_ALREADY_CLAIMED');
    return { claimed: false, duplicate: true, credits: claim.totalCredits || claim.baseCredits + claim.bonusCredits, backerNumber: claim.backerNumber ?? null };
  }
  if (claim.status !== 'eligible') throw new Error('FOUNDER_NOT_ELIGIBLE');

  const result = await FounderCreditClaim.updateOne(
    { _id: claim._id, status: 'eligible', userId: null },
    { $set: { status: 'claimed', userId: input.userId, claimedAt: new Date(), updatedAt: new Date() } },
  );
  if (!result.modifiedCount) throw new Error('FOUNDER_CLAIM_CONFLICT');

  const totalCredits = claim.totalCredits || claim.baseCredits + claim.bonusCredits;
  try {
    await grantFounderCredits(input.userId, totalCredits, `founder:${claim._id}`, {
      campaignId: input.campaignId,
      founderClaimId: String(claim._id),
      pledgeAmountCents: claim.pledgeAmountCents,
      baseCredits: claim.baseCredits,
      bonusCredits: claim.bonusCredits,
      backerNumber: claim.backerNumber ?? null,
      crowdfundingBackerId: claim.backerId ? String(claim.backerId) : null,
    });
    if (claim.backerId) {
      await CrowdfundingBacker.updateOne(
        { _id: claim.backerId },
        { $set: { creditStatus: 'claimed', claimedAt: new Date(), updatedAt: new Date() } },
      );
    }
  } catch (error) {
    await FounderCreditClaim.updateOne(
      { _id: claim._id, status: 'claimed', userId: input.userId },
      { $set: { status: 'eligible', userId: null, claimedAt: null, updatedAt: new Date() } },
    );
    if (claim.backerId) {
      await CrowdfundingBacker.updateOne(
        { _id: claim.backerId },
        { $set: { creditStatus: 'eligible', claimedAt: null, updatedAt: new Date() } },
      );
    }
    throw error;
  }
  return { claimed: true, duplicate: false, credits: totalCredits, backerNumber: claim.backerNumber ?? null };
}

export async function listFounderBackersForFulfillment(limit = 500) {
  await connectToDatabase();
  return CrowdfundingBacker.find({
    creditStatus: { $in: ['pending', 'eligible'] },
    totalCredits: { $gt: 0 },
  })
    .sort({ backerNumber: 1 })
    .limit(Math.max(1, Math.min(limit, 5000)))
    .lean();
}
