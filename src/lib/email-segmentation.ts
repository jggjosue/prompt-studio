import type { EmailPreferenceTopic } from '@/lib/email-preferences';

export const EMAIL_BEHAVIOR_SEGMENTS = [
  'new_registered',
  'activated',
  'inactive_7d',
  'inactive_30d',
  'image_creator',
  'video_creator',
  'web_creator',
  'premium_interest',
  'checkout_abandoned',
  'customer',
  'founding_member',
] as const;

export type EmailBehaviorSegment = (typeof EMAIL_BEHAVIOR_SEGMENTS)[number];

export type EmailSegmentationFacts = {
  registeredAt?: Date | null;
  activatedAt?: Date | null;
  lastActiveAt?: Date | null;
  createdImage?: boolean;
  createdVideo?: boolean;
  createdWeb?: boolean;
  premiumInterest?: boolean;
  checkoutAbandoned?: boolean;
  customer?: boolean;
  foundingMember?: boolean;
};

const DAY_MS = 86_400_000;

export function rebuildBehaviorSegments(
  facts: EmailSegmentationFacts,
  now = new Date(),
): EmailBehaviorSegment[] {
  const segments = new Set<EmailBehaviorSegment>();
  if (facts.registeredAt) segments.add('new_registered');
  if (facts.activatedAt) segments.add('activated');

  if (facts.lastActiveAt) {
    const inactiveDays = (now.getTime() - facts.lastActiveAt.getTime()) / DAY_MS;
    if (inactiveDays >= 7) segments.add('inactive_7d');
    if (inactiveDays >= 30) segments.add('inactive_30d');
  }

  if (facts.createdImage) segments.add('image_creator');
  if (facts.createdVideo) segments.add('video_creator');
  if (facts.createdWeb) segments.add('web_creator');
  if (facts.premiumInterest) segments.add('premium_interest');
  if (facts.checkoutAbandoned) segments.add('checkout_abandoned');
  if (facts.customer) segments.add('customer');
  if (facts.foundingMember) segments.add('founding_member');
  return EMAIL_BEHAVIOR_SEGMENTS.filter(segment => segments.has(segment));
}

export function rebuildPreferenceTopics(topics: readonly string[]): EmailPreferenceTopic[] {
  const allowed = new Set<EmailPreferenceTopic>(['product_updates', 'tutorials', 'offers']);
  return [...new Set(topics)].filter((topic): topic is EmailPreferenceTopic =>
    allowed.has(topic as EmailPreferenceTopic)
  );
}
