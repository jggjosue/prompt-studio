import 'server-only';

import connectToDatabase from '@/lib/mongoose';
import RetentionActivity from '@/models/RetentionActivity';
import UserActivation from '@/models/UserActivation';

export const RETENTION_DAYS = [1, 7, 30] as const;
export type RetentionDay = (typeof RETENTION_DAYS)[number];

const DAY_MS = 86_400_000;
export const utcDateKey = (date: Date) => date.toISOString().slice(0, 10);

export async function recordRetentionActivity(userId: string, at = new Date()) {
  await connectToDatabase();
  const activityDateUtc = utcDateKey(at);
  return RetentionActivity.findOneAndUpdate(
    { userId, activityDateUtc },
    {
      $setOnInsert: { userId, activityDateUtc, firstActivityAt: at },
      $set: { lastActivityAt: at },
    },
    { upsert: true, new: true }
  );
}

export async function getActivationRetentionMetrics(options: { from: Date; to: Date }) {
  await connectToDatabase();
  const activations = await UserActivation.find({
    activatedAt: { $gte: options.from, $lt: options.to },
  }).select({ userId: 1, activatedAt: 1, _id: 0 }).lean();

  const userIds = activations.map((row) => row.userId);
  const maxReturn = new Date(options.to.getTime() + 31 * DAY_MS);
  const activity = userIds.length
    ? await RetentionActivity.find({
        userId: { $in: userIds },
        firstActivityAt: { $lt: maxReturn },
      }).select({ userId: 1, activityDateUtc: 1, _id: 0 }).lean()
    : [];

  const activityByUser = new Map<string, Set<string>>();
  for (const row of activity) {
    const dates = activityByUser.get(row.userId) ?? new Set<string>();
    dates.add(row.activityDateUtc);
    activityByUser.set(row.userId, dates);
  }

  const retained = Object.fromEntries(RETENTION_DAYS.map((day) => [day, 0])) as Record<RetentionDay, number>;
  for (const activation of activations) {
    const anchor = new Date(activation.activatedAt);
    const dates = activityByUser.get(activation.userId);
    for (const day of RETENTION_DAYS) {
      const target = utcDateKey(new Date(anchor.getTime() + day * DAY_MS));
      if (dates?.has(target)) retained[day] += 1;
    }
  }

  const cohortSize = activations.length;
  return {
    cohort: 'activationDate' as const,
    timezone: 'UTC' as const,
    from: options.from.toISOString(),
    to: options.to.toISOString(),
    cohortSize,
    retention: RETENTION_DAYS.map((day) => ({
      day: `D${day}`,
      retainedUsers: retained[day],
      rate: cohortSize ? retained[day] / cohortSize : 0,
    })),
  };
}
