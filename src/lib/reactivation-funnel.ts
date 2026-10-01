import 'server-only';

import ReactivationAttempt from '@/models/ReactivationAttempt';
import UserActivity from '@/models/UserActivity';

export type ReactivationFunnelStage = 'return' | 'activation' | 'checkout' | 'purchase';
export type ReactivationCategory = 'image' | 'video' | 'web' | 'prompt';

const FIELD: Record<ReactivationFunnelStage, string> = {
  return: 'returnedAt', activation: 'activatedAt', checkout: 'checkoutAt', purchase: 'purchasedAt',
};

export async function recordReactivationStage(userId: string, stage: ReactivationFunnelStage, at = new Date()) {
  const field = FIELD[stage];
  return ReactivationAttempt.findOneAndUpdate(
    { userId, sentAt: { $lte: at }, [field]: null },
    { $set: { [field]: at } },
    { sort: { sentAt: -1 }, new: true }
  );
}

export async function recordUserProductActivity(userId: string, category: ReactivationCategory, at = new Date()) {
  return UserActivity.findOneAndUpdate(
    { userId },
    { $set: { lastActiveAt: at, priorCategory: category }, $setOnInsert: { firstSeenAt: at } },
    { upsert: true, new: true }
  );
}
