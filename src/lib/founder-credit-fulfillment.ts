import 'server-only';

import { grantFounderCredits } from '@/lib/ai-job-service';
import { getFounderRewardTier } from '@/lib/founder-credit-tiers';
import connectToDatabase from '@/lib/mongoose';
import FounderCreditClaim from '@/models/FounderCreditClaim';

export async function registerEligibleFounderBacker(input: {
  campaignId: string;
  backerEmail: string;
  pledgeAmountCents: number;
  currency: string;
  campaignEnded: boolean;
  fundsReceived: boolean;
  backerVerified: boolean;
  metadata?: Record<string, unknown>;
}) {
  if (!input.campaignId.trim() || input.campaignId.length > 120) throw new Error('FOUNDER_CAMPAIGN_INVALID');
  const email = input.backerEmail.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320) throw new Error('FOUNDER_EMAIL_INVALID');
  if (!input.campaignEnded || !input.fundsReceived || !input.backerVerified) throw new Error('FOUNDER_NOT_ELIGIBLE');
  if (input.currency.toUpperCase() !== 'USD') throw new Error('FOUNDER_CURRENCY_UNSUPPORTED');
  const tier = getFounderRewardTier(input.pledgeAmountCents);
  if (!tier) throw new Error('FOUNDER_TIER_INVALID');

  await connectToDatabase();
  return FounderCreditClaim.findOneAndUpdate(
    { campaignId: input.campaignId.trim(), backerEmail: email },
    { $setOnInsert: {
      pledgeAmountCents: input.pledgeAmountCents,
      currency: 'USD',
      rewardTier: tier.rewardTier,
      baseCredits: tier.baseCredits,
      bonusCredits: tier.bonusCredits,
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
    return { claimed: false, duplicate: true, credits: claim.baseCredits + claim.bonusCredits };
  }
  if (claim.status !== 'eligible') throw new Error('FOUNDER_NOT_ELIGIBLE');

  const result = await FounderCreditClaim.updateOne(
    { _id: claim._id, status: 'eligible', userId: null },
    { $set: { status: 'claimed', userId: input.userId, claimedAt: new Date(), updatedAt: new Date() } },
  );
  if (!result.modifiedCount) throw new Error('FOUNDER_CLAIM_CONFLICT');

  const totalCredits = claim.baseCredits + claim.bonusCredits;
  try {
    await grantFounderCredits(input.userId, totalCredits, `founder:${claim._id}`, {
      campaignId: input.campaignId,
      founderClaimId: String(claim._id),
      pledgeAmountCents: claim.pledgeAmountCents,
      baseCredits: claim.baseCredits,
      bonusCredits: claim.bonusCredits,
    });
  } catch (error) {
    await FounderCreditClaim.updateOne(
      { _id: claim._id, status: 'claimed', userId: input.userId },
      { $set: { status: 'eligible', userId: null, claimedAt: null, updatedAt: new Date() } },
    );
    throw error;
  }
  return { claimed: true, duplicate: false, credits: totalCredits };
}
