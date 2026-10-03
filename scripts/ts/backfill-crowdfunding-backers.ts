import 'dotenv/config';

import connectToDatabase from '../../src/lib/mongoose';
import CrowdfundingBacker from '../../src/models/CrowdfundingBacker';
import CrowdfundingContribution from '../../src/models/CrowdfundingContribution';
import CrowdfundingSequence from '../../src/models/CrowdfundingSequence';
import FounderCreditClaim from '../../src/models/FounderCreditClaim';
import { FOUNDER_CROWDFUNDING_CAMPAIGN_ID } from '../../src/lib/crowdfunding-backer-ledger';

function identityKey(row: { purchaserUserId?: string | null; purchaserEmail?: string | null; stripeCheckoutSessionId: string }) {
  const userId = row.purchaserUserId?.trim();
  if (userId) return `user:${userId}`;
  const email = row.purchaserEmail?.trim().toLowerCase();
  if (email) return `email:${email}`;
  return `session:${row.stripeCheckoutSessionId}`;
}

async function main() {
  const db = await connectToDatabase();
  const session = await db.startSession();

  try {
    await session.withTransaction(async () => {
      const contributions = await CrowdfundingContribution.find({})
        .sort({ paidAt: 1, createdAt: 1, _id: 1 })
        .session(session);

      const backersByIdentity = new Map<string, InstanceType<typeof CrowdfundingBacker>>();
      let nextNumber = 0;

      for (const contribution of contributions) {
        const key = identityKey(contribution);
        let backer = backersByIdentity.get(key);

        if (!backer) {
          nextNumber += 1;
          [backer] = await CrowdfundingBacker.create([{
            campaignId: FOUNDER_CROWDFUNDING_CAMPAIGN_ID,
            backerNumber: nextNumber,
            purchaserUserId: contribution.purchaserUserId ?? null,
            purchaserEmail: contribution.purchaserEmail ?? null,
            totalContributedCents: 0,
            totalBaseCredits: 0,
            totalBonusCredits: 0,
            totalCredits: 0,
            contributionCount: 0,
            creditStatus: 'pending',
            firstContributionAt: contribution.paidAt,
            lastContributionAt: contribution.paidAt,
            createdAt: contribution.createdAt ?? contribution.paidAt,
            updatedAt: new Date(),
          }], { session });
          backersByIdentity.set(key, backer);
        }

        contribution.campaignId = FOUNDER_CROWDFUNDING_CAMPAIGN_ID;
        contribution.backerId = backer._id;
        contribution.backerNumber = backer.backerNumber;
        await contribution.save({ session });

        if (contribution.status === 'paid') {
          backer.totalContributedCents += contribution.amountPaidCents;
          backer.totalBaseCredits += contribution.baseCredits;
          backer.totalBonusCredits += contribution.bonusCredits;
          backer.totalCredits += contribution.totalCredits;
          backer.contributionCount += 1;
          backer.lastContributionAt = contribution.paidAt;
        }
      }

      for (const backer of backersByIdentity.values()) {
        backer.creditStatus = backer.totalCredits > 0 ? 'pending' : 'cancelled';
        backer.updatedAt = new Date();
        await backer.save({ session });

        if (backer.purchaserEmail) {
          const existingClaim = await FounderCreditClaim.findOne({
            campaignId: FOUNDER_CROWDFUNDING_CAMPAIGN_ID,
            backerEmail: backer.purchaserEmail,
          }).session(session);

          if (existingClaim) {
            existingClaim.backerId = backer._id;
            existingClaim.backerNumber = backer.backerNumber;
            existingClaim.pledgeAmountCents = backer.totalContributedCents;
            existingClaim.baseCredits = backer.totalBaseCredits;
            existingClaim.bonusCredits = backer.totalBonusCredits;
            existingClaim.totalCredits = backer.totalCredits;
            existingClaim.updatedAt = new Date();
            await existingClaim.save({ session });
            backer.founderClaimId = existingClaim._id;
            await backer.save({ session });
          }
        }
      }

      await CrowdfundingSequence.findOneAndUpdate(
        { _id: `${FOUNDER_CROWDFUNDING_CAMPAIGN_ID}:backers` },
        { $set: { value: nextNumber, updatedAt: new Date() } },
        { upsert: true, session },
      );

      console.log(`Backfilled ${contributions.length} contributions into ${nextNumber} ordered crowdfunding backers.`);
    });
  } finally {
    await session.endSession();
    await db.disconnect();
  }
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
