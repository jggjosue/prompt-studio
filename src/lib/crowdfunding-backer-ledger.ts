import 'server-only';

import connectToDatabase from '@/lib/mongoose';
import { FOUNDER_CROWDFUNDING_CAMPAIGN_ID } from '@/lib/crowdfunding-campaign-config';
import CrowdfundingBacker from '@/models/CrowdfundingBacker';
import CrowdfundingContribution from '@/models/CrowdfundingContribution';
import CrowdfundingSequence from '@/models/CrowdfundingSequence';
import FounderCreditClaim from '@/models/FounderCreditClaim';

type RecordContributionInput = {
  stripeCheckoutSessionId: string;
  stripePaymentIntentId?: string | null;
  purchaserUserId?: string | null;
  purchaserEmail?: string | null;
  amountPaidCents: number;
  currency: string;
  baseCredits: number;
  bonusCredits: number;
  totalCredits: number;
  rewardTier: string;
  paidAt?: Date;
};

function normalizeEmail(value?: string | null) {
  const email = value?.trim().toLowerCase();
  return email || null;
}

export async function recordCrowdfundingContribution(input: RecordContributionInput) {
  const db = await connectToDatabase();
  const mongoSession = await db.startSession();
  const email = normalizeEmail(input.purchaserEmail);
  const userId = input.purchaserUserId?.trim() || null;
  const paidAt = input.paidAt ?? new Date();
  let result: { backerNumber: number; backerId: string; contributionId: string; totalCredits: number } | null = null;

  try {
    await mongoSession.withTransaction(async () => {
      const existing = await CrowdfundingContribution
        .findOne({ stripeCheckoutSessionId: input.stripeCheckoutSessionId })
        .session(mongoSession);

      if (existing) {
        if (!existing.backerNumber || !existing.backerId || !existing.campaignId) {
          throw new Error('CROWDFUNDING_BACKER_BACKFILL_REQUIRED');
        }
        result = {
          backerNumber: existing.backerNumber,
          backerId: String(existing.backerId),
          contributionId: String(existing._id),
          totalCredits: existing.totalCredits,
        };
        return;
      }

      let backer = userId
        ? await CrowdfundingBacker.findOne({
            campaignId: FOUNDER_CROWDFUNDING_CAMPAIGN_ID,
            purchaserUserId: userId,
          }).session(mongoSession)
        : null;

      if (!backer && email) {
        backer = await CrowdfundingBacker.findOne({
          campaignId: FOUNDER_CROWDFUNDING_CAMPAIGN_ID,
          purchaserEmail: email,
        }).session(mongoSession);
      }

      if (!backer) {
        const sequenceId = `${FOUNDER_CROWDFUNDING_CAMPAIGN_ID}:backers`;
        const existingSequence = await CrowdfundingSequence.findById(sequenceId).session(mongoSession);
        if (!existingSequence) {
          const legacyContribution = await CrowdfundingContribution.exists({
            $or: [
              { campaignId: { $exists: false } },
              { backerNumber: { $exists: false } },
              { backerId: { $exists: false } },
            ],
          }).session(mongoSession);
          if (legacyContribution) throw new Error('CROWDFUNDING_BACKER_BACKFILL_REQUIRED');
        }

        const sequence = await CrowdfundingSequence.findOneAndUpdate(
          { _id: sequenceId },
          { $inc: { value: 1 }, $set: { updatedAt: new Date() } },
          { upsert: true, returnDocument: 'after', session: mongoSession },
        );
        if (!sequence?.value) throw new Error('CROWDFUNDING_BACKER_SEQUENCE_FAILED');

        [backer] = await CrowdfundingBacker.create([{
          campaignId: FOUNDER_CROWDFUNDING_CAMPAIGN_ID,
          backerNumber: sequence.value,
          purchaserUserId: userId,
          purchaserEmail: email,
          totalContributedCents: 0,
          totalBaseCredits: 0,
          totalBonusCredits: 0,
          totalCredits: 0,
          contributionCount: 0,
          creditStatus: 'pending',
          firstContributionAt: paidAt,
          lastContributionAt: paidAt,
          createdAt: new Date(),
          updatedAt: new Date(),
        }], { session: mongoSession });
      }

      const [contribution] = await CrowdfundingContribution.create([{
        campaignId: FOUNDER_CROWDFUNDING_CAMPAIGN_ID,
        backerId: backer._id,
        backerNumber: backer.backerNumber,
        stripeCheckoutSessionId: input.stripeCheckoutSessionId,
        stripePaymentIntentId: input.stripePaymentIntentId ?? null,
        purchaserUserId: userId,
        purchaserEmail: email,
        amountPaidCents: input.amountPaidCents,
        currency: input.currency.toUpperCase(),
        status: 'paid',
        baseCredits: input.baseCredits,
        bonusCredits: input.bonusCredits,
        totalCredits: input.totalCredits,
        creditStatus: 'pending',
        paidAt,
        refundedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }], { session: mongoSession });

      backer = await CrowdfundingBacker.findByIdAndUpdate(
        backer._id,
        {
          $inc: {
            totalContributedCents: input.amountPaidCents,
            totalBaseCredits: input.baseCredits,
            totalBonusCredits: input.bonusCredits,
            totalCredits: input.totalCredits,
            contributionCount: 1,
          },
          $set: {
            ...(userId ? { purchaserUserId: userId } : {}),
            ...(email ? { purchaserEmail: email } : {}),
            lastContributionAt: paidAt,
            updatedAt: new Date(),
          },
        },
        { returnDocument: 'after', session: mongoSession },
      );
      if (!backer) throw new Error('CROWDFUNDING_BACKER_UPDATE_FAILED');

      if (email) {
        const claim = await FounderCreditClaim.findOneAndUpdate(
          { campaignId: FOUNDER_CROWDFUNDING_CAMPAIGN_ID, backerEmail: email },
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
              status: 'pending',
              metadata: {
                source: 'stripe_crowdfunding',
                latestContributionId: String(contribution._id),
                latestRewardTier: input.rewardTier,
                contributionCount: backer.contributionCount,
              },
              updatedAt: new Date(),
            },
            $setOnInsert: { createdAt: new Date() },
          },
          { upsert: true, returnDocument: 'after', session: mongoSession },
        );

        await CrowdfundingBacker.updateOne(
          { _id: backer._id },
          { $set: { founderClaimId: claim._id, updatedAt: new Date() } },
          { session: mongoSession },
        );
      }

      result = {
        backerNumber: backer.backerNumber,
        backerId: String(backer._id),
        contributionId: String(contribution._id),
        totalCredits: backer.totalCredits,
      };
    });
  } finally {
    await mongoSession.endSession();
  }

  if (!result) throw new Error('CROWDFUNDING_CONTRIBUTION_RECORD_FAILED');
  return result;
}

export async function markCrowdfundingContributionRefunded(input: {
  stripePaymentIntentId?: string | null;
  stripeCheckoutSessionId?: string | null;
}) {
  const db = await connectToDatabase();
  const mongoSession = await db.startSession();

  try {
    await mongoSession.withTransaction(async () => {
      const selector = input.stripeCheckoutSessionId
        ? { stripeCheckoutSessionId: input.stripeCheckoutSessionId }
        : input.stripePaymentIntentId
          ? { stripePaymentIntentId: input.stripePaymentIntentId }
          : null;
      if (!selector) return;

      const contribution = await CrowdfundingContribution.findOne(selector).session(mongoSession);
      if (!contribution || contribution.status === 'refunded') return;

      contribution.status = 'refunded';
      contribution.creditStatus = 'cancelled';
      contribution.refundedAt = new Date();
      contribution.updatedAt = new Date();
      await contribution.save({ session: mongoSession });

      const backer = await CrowdfundingBacker.findByIdAndUpdate(
        contribution.backerId,
        {
          $inc: {
            totalContributedCents: -contribution.amountPaidCents,
            totalBaseCredits: -contribution.baseCredits,
            totalBonusCredits: -contribution.bonusCredits,
            totalCredits: -contribution.totalCredits,
            contributionCount: -1,
          },
          $set: { updatedAt: new Date() },
        },
        { returnDocument: 'after', session: mongoSession },
      );

      if (!backer) return;
      const nextStatus =
        backer.totalCredits <= 0
          ? 'cancelled'
          : backer.creditStatus === 'claimed'
            ? 'claimed'
            : backer.creditStatus === 'eligible'
              ? 'eligible'
              : 'pending';
      await CrowdfundingBacker.updateOne(
        { _id: backer._id },
        { $set: { creditStatus: nextStatus, updatedAt: new Date() } },
        { session: mongoSession },
      );

      if (backer.purchaserEmail) {
        await FounderCreditClaim.updateOne(
          { campaignId: FOUNDER_CROWDFUNDING_CAMPAIGN_ID, backerEmail: backer.purchaserEmail },
          {
            $set: {
              pledgeAmountCents: Math.max(0, backer.totalContributedCents),
              baseCredits: Math.max(0, backer.totalBaseCredits),
              bonusCredits: Math.max(0, backer.totalBonusCredits),
              totalCredits: Math.max(0, backer.totalCredits),
              status: nextStatus,
              updatedAt: new Date(),
            },
          },
          { session: mongoSession },
        );
      }
    });
  } finally {
    await mongoSession.endSession();
  }
}

export async function listCrowdfundingBackersInOrder() {
  await connectToDatabase();
  return CrowdfundingBacker.find({ campaignId: FOUNDER_CROWDFUNDING_CAMPAIGN_ID })
    .sort({ backerNumber: 1 })
    .lean();
}
