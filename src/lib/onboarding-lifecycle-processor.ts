import 'server-only';

import OnboardingLifecycleEnrollment from '@/models/OnboardingLifecycleEnrollment';
import UserProfile from '@/models/UserProfile';
import { ONBOARDING_SEQUENCE, type OnboardingBehavior } from '@/lib/onboarding-lifecycle';
import { sendOnboardingStep } from '@/lib/onboarding-lifecycle-sender';

const HOUR = 60 * 60 * 1000;

export async function enrollOnboardingLifecycle(userId: string, enrolledAt = new Date()) {
  return OnboardingLifecycleEnrollment.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId, enrolledAt, nextStep: 1 } },
    { upsert: true, new: true }
  );
}

export async function processDueOnboardingEnrollment(params: {
  userId: string;
  origin: string;
  behavior?: OnboardingBehavior;
  purchased?: boolean;
  now?: Date;
}) {
  const now = params.now ?? new Date();
  const enrollment = await OnboardingLifecycleEnrollment.findOne({ userId: params.userId, completedAt: null });
  if (!enrollment) return { processed: false as const, reason: 'not_enrolled' as const };

  const step = ONBOARDING_SEQUENCE.find(item => item.step === enrollment.nextStep);
  if (!step) {
    enrollment.completedAt = now;
    await enrollment.save();
    return { processed: false as const, reason: 'completed' as const };
  }

  const dueAt = new Date(enrollment.enrolledAt.getTime() + step.delayHours * HOUR);
  if (dueAt > now) return { processed: false as const, reason: 'not_due' as const, dueAt };

  const recipient = await UserProfile.findOne({ userId: params.userId }).lean();
  if (!recipient?.email) return { processed: false as const, reason: 'profile_missing' as const };

  const result = await sendOnboardingStep({
    recipient,
    step,
    origin: params.origin,
    behavior: params.behavior ?? 'unknown',
    purchased: params.purchased === true,
  });

  enrollment.lastAttemptAt = now;
  if (result.sent) enrollment.lastProviderMessageId = result.id;
  // Eligibility is re-checked for every step. An ineligible step is consumed
  // instead of retrying promotional mail after consent has been withdrawn.
  enrollment.nextStep = step.step + 1;
  if (enrollment.nextStep > ONBOARDING_SEQUENCE.length) enrollment.completedAt = now;
  await enrollment.save();

  return { processed: true as const, step: step.step, send: result };
}


export async function processDueOnboardingBatch(params: {
  origin: string;
  now?: Date;
  limit?: number;
}) {
  const now = params.now ?? new Date();
  const enrollments = await OnboardingLifecycleEnrollment.find({
    completedAt: null,
    nextStep: { $gte: 1, $lte: ONBOARDING_SEQUENCE.length },
  }).sort({ enrolledAt: 1 }).limit(params.limit ?? 100).lean();

  const results = [];
  for (const enrollment of enrollments) {
    const step = ONBOARDING_SEQUENCE.find(item => item.step === enrollment.nextStep);
    if (!step) continue;
    const dueAt = new Date(enrollment.enrolledAt.getTime() + step.delayHours * HOUR);
    if (dueAt > now) continue;

    results.push(await processDueOnboardingEnrollment({
      userId: enrollment.userId,
      origin: params.origin,
      now,
    }));
  }
  return results;
}
