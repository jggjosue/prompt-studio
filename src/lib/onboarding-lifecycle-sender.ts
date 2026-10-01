import 'server-only';

import { buildEmailUrl } from '@/lib/email-attribution';
import { canSendNonTransactional } from '@/lib/email-suppression';
import { getEmailStreamConfig } from '@/lib/email-streams';
import { resend } from '@/lib/resend';
import {
  ONBOARDING_SEQUENCE_ID,
  onboardingDestination,
  renderOnboardingText,
  shouldSendOnboardingStep,
  type OnboardingBehavior,
  type OnboardingStep,
} from '@/lib/onboarding-lifecycle';

export type OnboardingRecipient = {
  email: string;
  marketingOptIn?: boolean;
  unsubscribeTimestamp?: Date | null;
  emailSuppressedAt?: Date | null;
  emailSuppressionReason?: 'unsubscribe' | 'hard_bounce' | 'complaint' | 'manual' | null;
  emailDoNotContact?: boolean;
  emailPreferenceTopics?: string[];
};

export async function sendOnboardingStep(params: {
  recipient: OnboardingRecipient;
  step: OnboardingStep;
  origin: string;
  behavior: OnboardingBehavior;
  purchased: boolean;
}) {
  const { recipient, step } = params;
  const marketingEligible = canSendNonTransactional(recipient, 'lifecycle');
  const topicEnabled = recipient.emailPreferenceTopics?.includes(step.topic) === true;
  if (!shouldSendOnboardingStep({ step, marketingEligible, topicEnabled, purchased: params.purchased })) {
    return { sent: false as const, reason: 'ineligible' as const };
  }

  const stream = getEmailStreamConfig('lifecycle');
  if (!stream) return { sent: false as const, reason: 'not_configured' as const };

  const ctaUrl = onboardingDestination(step, params.origin, params.behavior);
  const preferencesUrl = buildEmailUrl(new URL('/email/preferences', params.origin).toString(), {
    campaignId: step.campaignId,
    sequenceId: ONBOARDING_SEQUENCE_ID,
    lifecycleTrigger: 'new_registered',
    utmCampaign: step.campaignId,
  });
  const unsubscribeUrl = buildEmailUrl(new URL('/email/unsubscribe', params.origin).toString(), {
    campaignId: step.campaignId,
    sequenceId: ONBOARDING_SEQUENCE_ID,
    lifecycleTrigger: 'new_registered',
    utmCampaign: step.campaignId,
  });

  const response = await resend.emails.send({
    from: stream.from,
    ...(stream.replyTo ? { replyTo: stream.replyTo } : {}),
    to: recipient.email.trim().toLowerCase(),
    subject: step.subject,
    text: renderOnboardingText(step, ctaUrl, preferencesUrl, unsubscribeUrl),
    headers: {
      'X-Prompt-Studio-Campaign': step.campaignId,
      'X-Prompt-Studio-Sequence': ONBOARDING_SEQUENCE_ID,
    },
  });
  if (response.error) throw response.error;
  return { sent: true as const, id: response.data?.id ?? null, campaignId: step.campaignId };
}
