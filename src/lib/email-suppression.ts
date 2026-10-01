import 'server-only';

export type SuppressionReason = 'unsubscribe' | 'hard_bounce' | 'complaint' | 'manual';

export type NonTransactionalRecipient = {
  marketingOptIn?: boolean;
  unsubscribeTimestamp?: Date | null;
  emailSuppressedAt?: Date | null;
  emailSuppressionReason?: SuppressionReason | null;
  emailDoNotContact?: boolean;
};

export function canSendNonTransactional(
  recipient: NonTransactionalRecipient,
  stream: 'lifecycle' | 'outreach'
): boolean {
  if (recipient.emailSuppressedAt || recipient.emailSuppressionReason) return false;
  if (recipient.unsubscribeTimestamp) return false;
  if (recipient.emailDoNotContact) return false;
  if (stream === 'lifecycle') return recipient.marketingOptIn === true;
  return true;
}

export function suppressionPatch(reason: SuppressionReason, at = new Date()) {
  return {
    marketingOptIn: false,
    emailSuppressedAt: at,
    emailSuppressionReason: reason,
    ...(reason === 'unsubscribe' ? { unsubscribeTimestamp: at } : {}),
    ...(reason === 'manual' ? { emailDoNotContact: true } : {}),
    emailPreferencesUpdatedAt: at,
    lastUpdatedAt: at,
  };
}

// Re-import/sync code must preserve an existing suppression. Provider state is
// derived from the product record; import is never an implicit resubscribe.
export function resendUnsubscribedState(recipient: NonTransactionalRecipient): boolean {
  return !canSendNonTransactional(recipient, 'lifecycle');
}
