import { NextResponse } from 'next/server';

import { isPremiumJoAdmin } from '@/lib/admin-auth';
import connectToDatabase from '@/lib/mongoose';
import CrowdfundingBacker from '@/models/CrowdfundingBacker';
import CrowdfundingContribution from '@/models/CrowdfundingContribution';
import { FOUNDER_CROWDFUNDING_CAMPAIGN_ID } from '@/lib/crowdfunding-backer-ledger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!(await isPremiumJoAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  await connectToDatabase();
  const url = new URL(request.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit') ?? '500'), 1), 5000);
  const creditStatus = url.searchParams.get('status');

  const query: Record<string, unknown> = { campaignId: FOUNDER_CROWDFUNDING_CAMPAIGN_ID };
  if (creditStatus && ['pending', 'eligible', 'claimed', 'cancelled'].includes(creditStatus)) {
    query.creditStatus = creditStatus;
  }

  const backers = await CrowdfundingBacker.find(query)
    .sort({ backerNumber: 1 })
    .limit(limit)
    .lean();

  const backerIds = backers.map((backer) => backer._id);
  const contributions = await CrowdfundingContribution.find({ backerId: { $in: backerIds } })
    .sort({ backerNumber: 1, paidAt: 1 })
    .lean();

  const contributionsByBacker = new Map<string, typeof contributions>();
  for (const contribution of contributions) {
    const key = String(contribution.backerId);
    const rows = contributionsByBacker.get(key) ?? [];
    rows.push(contribution);
    contributionsByBacker.set(key, rows);
  }

  return NextResponse.json({
    campaignId: FOUNDER_CROWDFUNDING_CAMPAIGN_ID,
    count: backers.length,
    backers: backers.map((backer) => ({
      id: String(backer._id),
      backerNumber: backer.backerNumber,
      purchaserUserId: backer.purchaserUserId ?? null,
      purchaserEmail: backer.purchaserEmail ?? null,
      totalContributedCents: backer.totalContributedCents,
      totalBaseCredits: backer.totalBaseCredits,
      totalBonusCredits: backer.totalBonusCredits,
      totalCredits: backer.totalCredits,
      contributionCount: backer.contributionCount,
      creditStatus: backer.creditStatus,
      founderClaimId: backer.founderClaimId ? String(backer.founderClaimId) : null,
      firstContributionAt: backer.firstContributionAt,
      lastContributionAt: backer.lastContributionAt,
      claimedAt: backer.claimedAt ?? null,
      contributions: (contributionsByBacker.get(String(backer._id)) ?? []).map((row) => ({
        id: String(row._id),
        stripeCheckoutSessionId: row.stripeCheckoutSessionId,
        stripePaymentIntentId: row.stripePaymentIntentId ?? null,
        amountPaidCents: row.amountPaidCents,
        currency: row.currency,
        baseCredits: row.baseCredits,
        bonusCredits: row.bonusCredits,
        totalCredits: row.totalCredits,
        status: row.status,
        creditStatus: row.creditStatus,
        paidAt: row.paidAt,
        refundedAt: row.refundedAt ?? null,
      })),
    })),
  }, {
    headers: { 'Cache-Control': 'private, no-store' },
  });
}
