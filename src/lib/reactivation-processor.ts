import 'server-only';

import connectToDatabase from '@/lib/mongoose';
import { reactivationWindow, type PriorCategory } from '@/lib/reactivation-campaign';
import { sendReactivationEmail } from '@/lib/reactivation-sender';
import ReactivationAttempt from '@/models/ReactivationAttempt';
import UserActivity from '@/models/UserActivity';
import UserProfile from '@/models/UserProfile';

function categoryFromActivity(activity: { priorCategory?: string | null }): PriorCategory {
  return ['image', 'video', 'web', 'prompt'].includes(activity.priorCategory ?? '') ? activity.priorCategory as PriorCategory : 'unknown';
}

export async function processInactiveReactivationBatch(params: { origin: string; now?: Date; limit?: number }) {
  await connectToDatabase();
  const now = params.now ?? new Date();
  const cutoff = new Date(now.getTime() - 7 * 86_400_000);
  const activities = await UserActivity.find({ lastActiveAt: { $lte: cutoff } }).sort({ lastActiveAt: 1 }).limit(params.limit ?? 100).lean();
  const results = [];

  for (const activity of activities) {
    const [profile, attempts] = await Promise.all([
      UserProfile.findOne({ userId: activity.userId }).lean(),
      ReactivationAttempt.find({ userId: activity.userId }).sort({ sentAt: 1 }).lean(),
    ]);
    if (!profile) continue;

    const priorCategory = categoryFromActivity(activity as { priorCategory?: string | null });
    const window = reactivationWindow({
      userId: activity.userId,
      lastActiveAt: activity.lastActiveAt,
      priorCategory,
      purchased: attempts.some(attempt => Boolean(attempt.purchasedAt)),
      marketingEligible: profile.marketingOptIn === true && !profile.unsubscribeTimestamp,
      previousReactivationCount: attempts.length,
    }, now);
    if (!window) continue;
    if (attempts.some(attempt => attempt.window === window)) continue;

    const sent = await sendReactivationEmail({ recipient: profile, window, priorCategory, origin: params.origin });
    if (!sent.sent) {
      results.push({ userId: activity.userId, window, sent: false, reason: sent.reason });
      continue;
    }

    try {
      await ReactivationAttempt.create({
        userId: activity.userId,
        window,
        priorCategory,
        campaignId: `reactivation_${window}_${priorCategory}`,
        sentAt: now,
      });
      results.push({ userId: activity.userId, window, sent: true });
    } catch (error) {
      if ((error as { code?: number }).code !== 11000) throw error;
    }
  }
  return results;
}
