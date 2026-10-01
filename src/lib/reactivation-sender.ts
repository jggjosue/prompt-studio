import 'server-only';

import { canSendNonTransactional } from '@/lib/email-suppression';
import { getEmailStreamConfig } from '@/lib/email-streams';
import { resend } from '@/lib/resend';
import { reactivationReason, reactivationUrl, type PriorCategory, type ReactivationWindow } from '@/lib/reactivation-campaign';

export async function sendReactivationEmail(params: {
  recipient: {
    email: string;
    marketingOptIn?: boolean;
    unsubscribeTimestamp?: Date | null;
    emailSuppressedAt?: Date | null;
    emailSuppressionReason?: 'unsubscribe' | 'hard_bounce' | 'complaint' | 'manual' | null;
    emailDoNotContact?: boolean;
    emailPreferenceTopics?: string[];
  };
  window: ReactivationWindow;
  priorCategory: PriorCategory;
  origin: string;
}) {
  if (!canSendNonTransactional(params.recipient, 'lifecycle')) return { sent: false as const, reason: 'ineligible' as const };
  if (!params.recipient.emailPreferenceTopics?.includes('product_updates')) return { sent: false as const, reason: 'topic_disabled' as const };

  const stream = getEmailStreamConfig('lifecycle');
  if (!stream) return { sent: false as const, reason: 'not_configured' as const };
  const cta = reactivationUrl(params.origin, params.window, params.priorCategory);
  const response = await resend.emails.send({
    from: stream.from,
    ...(stream.replyTo ? { replyTo: stream.replyTo } : {}),
    to: params.recipient.email.trim().toLowerCase(),
    subject: params.window === '7d' ? 'Continúa donde lo dejaste en Prompt Studio' : 'Tus flujos siguen listos cuando quieras volver',
    text: `${reactivationReason(params.priorCategory)}\n\nContinuar: ${cta}\n\nGestiona tus preferencias: ${new URL('/email/preferences', params.origin)}\nCancelar emails: ${new URL('/email/unsubscribe', params.origin)}`,
    headers: { 'X-Prompt-Studio-Campaign': `reactivation_${params.window}_${params.priorCategory}`, 'X-Prompt-Studio-Sequence': 'inactive_user_reactivation' },
  });
  if (response.error) throw response.error;
  return { sent: true as const, id: response.data?.id ?? null };
}
