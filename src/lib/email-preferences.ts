import 'server-only';

import UserProfile from '@/models/UserProfile';

export const EMAIL_PREFERENCE_TOPICS = [
  'product_updates',
  'tutorials',
  'offers',
] as const;

export type EmailPreferenceTopic = (typeof EMAIL_PREFERENCE_TOPICS)[number];

export type EmailPreferenceChange = {
  userId: string;
  marketingOptIn: boolean;
  source: string;
  consentVersion?: string | null;
  topics?: EmailPreferenceTopic[];
  locale?: string | null;
  changedAt?: Date;
};

export async function updateEmailPreferences(change: EmailPreferenceChange) {
  const changedAt = change.changedAt ?? new Date();
  const topics = [...new Set(change.topics ?? [])];

  const update = {
    marketingOptIn: change.marketingOptIn,
    consentTimestamp: change.marketingOptIn ? changedAt : null,
    consentSource: change.marketingOptIn ? change.source : null,
    consentVersion: change.marketingOptIn ? (change.consentVersion ?? null) : null,
    unsubscribeTimestamp: change.marketingOptIn ? null : changedAt,
    emailPreferenceTopics: topics,
    emailLocale: change.locale ?? null,
    emailPreferencesUpdatedAt: changedAt,
    lastUpdatedAt: changedAt,
  };

  return UserProfile.findOneAndUpdate(
    { userId: change.userId },
    {
      $set: update,
      $push: {
        emailPreferenceAudit: {
          changedAt,
          source: change.source,
          marketingOptIn: change.marketingOptIn,
          topics,
          locale: change.locale ?? null,
          consentVersion: change.consentVersion ?? null,
        },
      },
    },
    { new: true, runValidators: true }
  );
}

export function isEligibleForMarketing(profile: {
  marketingOptIn?: boolean;
  unsubscribeTimestamp?: Date | null;
}) {
  return profile.marketingOptIn === true && !profile.unsubscribeTimestamp;
}
