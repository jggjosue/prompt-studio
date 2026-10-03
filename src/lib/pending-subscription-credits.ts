import 'server-only';

import connectToDatabase from '@/lib/mongoose';
import { grantSubscriptionCredits } from '@/lib/ai-job-service';
import PendingSubscriptionCredit from '@/models/PendingSubscriptionCredit';

export function areCrowdfundingCreditsActive(): boolean {
  return process.env.CROWDFUNDING_CREDITS_ACTIVE === '1';
}

export async function recordPendingSubscriptionCredits(input: {
  userId: string;
  plan: 'creator' | 'pro' | 'studio';
  credits: number;
  stripeInvoiceId: string;
  stripeSubscriptionId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  if (!input.userId || !input.stripeInvoiceId || !Number.isFinite(input.credits) || input.credits <= 0) {
    throw new Error('INVALID_PENDING_SUBSCRIPTION_CREDIT');
  }
  await connectToDatabase();
  const requestId = `pending-subscription:${input.userId}:${input.stripeInvoiceId}`;
  return PendingSubscriptionCredit.findOneAndUpdate(
    { requestId },
    {
      $setOnInsert: {
        userId: input.userId,
        plan: input.plan,
        credits: input.credits,
        requestId,
        stripeInvoiceId: input.stripeInvoiceId,
        stripeSubscriptionId: input.stripeSubscriptionId ?? null,
        status: 'pending',
        metadata: input.metadata ?? {},
        createdAt: new Date(),
      },
      $set: { updatedAt: new Date() },
    },
    { upsert: true, returnDocument: 'after' },
  );
}

export async function getPendingSubscriptionCredits(userId: string): Promise<number> {
  await connectToDatabase();
  const rows = await PendingSubscriptionCredit.aggregate([
    { $match: { userId, status: 'pending' } },
    { $group: { _id: null, total: { $sum: '$credits' } } },
  ]);
  return Number(rows[0]?.total ?? 0);
}

export async function activatePendingSubscriptionCredits(userId: string): Promise<number> {
  await connectToDatabase();
  const rows = await PendingSubscriptionCredit.find({ userId, status: 'pending' }).sort({ createdAt: 1 });
  let activated = 0;
  for (const row of rows) {
    const granted = await grantSubscriptionCredits(
      userId,
      row.credits,
      `pending-release:${row.requestId}`,
      { ...row.metadata, pendingCreditId: String(row._id), releasedAfterCampaign: true },
    );
    if (granted) activated += row.credits;
    row.status = 'activated';
    row.activatedAt = new Date();
    row.updatedAt = new Date();
    await row.save();
  }
  return activated;
}
