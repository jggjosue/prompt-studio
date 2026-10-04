import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import CrowdfundingContribution from '@/models/CrowdfundingContribution';
import CrowdfundingBacker from '@/models/CrowdfundingBacker';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const GOAL_CENTS = 2_500_000;

export async function GET() {
  await connectToDatabase();
  const rows = await CrowdfundingContribution.aggregate([
    { $match: { status: 'paid', currency: 'USD' } },
    { $group: { _id: null, raisedCents: { $sum: '$amountPaidCents' }, backers: { $sum: 1 } } },
  ]);

  const raisedCents = Number(rows[0]?.raisedCents ?? 0);
  const backers = await CrowdfundingBacker.countDocuments({
    totalContributedCents: { $gt: 0 },
    creditStatus: { $ne: 'cancelled' },
  });
  const percent = GOAL_CENTS > 0 ? Math.min(100, Math.max(0, (raisedCents / GOAL_CENTS) * 100)) : 0;

  return NextResponse.json(
    { raisedCents, goalCents: GOAL_CENTS, backers, percent },
    { headers: { 'Cache-Control': 'no-store, max-age=0' } },
  );
}
