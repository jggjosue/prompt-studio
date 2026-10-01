import 'server-only';

import { canSendLifecycleMessage, type EmailEligibilitySnapshot, type NonTransactionalMessageKind } from '@/lib/email-frequency-policy';
import EmailSendLedger from '@/models/EmailSendLedger';

export async function recheckScheduledEmail(input: {
  recipientKey: string;
  kind: NonTransactionalMessageKind;
  snapshot: EmailEligibilitySnapshot;
  campaignId?: string;
  now?: Date;
}) {
  const now = input.now ?? new Date();
  const decision = canSendLifecycleMessage(input.kind, input.snapshot, now);

  if (!decision.allowed) {
    await EmailSendLedger.create({
      recipientKey: input.recipientKey,
      kind: input.kind,
      campaignId: input.campaignId ?? null,
      eligibilityCheckedAt: now,
      blockedReason: decision.reason,
    });
  }
  return decision;
}

export async function recordNonTransactionalSend(input: {
  recipientKey: string;
  kind: NonTransactionalMessageKind;
  campaignId?: string;
  sentAt?: Date;
}) {
  return EmailSendLedger.create({
    recipientKey: input.recipientKey,
    kind: input.kind,
    campaignId: input.campaignId ?? null,
    eligibilityCheckedAt: input.sentAt ?? new Date(),
    sentAt: input.sentAt ?? new Date(),
  });
}
