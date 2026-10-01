export type NonTransactionalMessageKind = 'checkout' | 'onboarding' | 'reactivation' | 'newsletter' | 'sales';

export const MESSAGE_PRIORITY: Record<NonTransactionalMessageKind, number> = {
  checkout: 50,
  onboarding: 40,
  reactivation: 30,
  newsletter: 20,
  sales: 10,
};

export const GLOBAL_NON_TRANSACTIONAL_CAP = { max: 3, windowMs: 7 * 24 * 60 * 60 * 1000 } as const;

export type EmailEligibilitySnapshot = {
  unsubscribed: boolean;
  suppressed: boolean;
  purchased: boolean;
  recentNonTransactionalSentAt: readonly Date[];
  pendingHigherPriorityKinds?: readonly NonTransactionalMessageKind[];
};

const PRE_PURCHASE = new Set<NonTransactionalMessageKind>(['checkout', 'onboarding', 'reactivation', 'sales']);

export function canSendLifecycleMessage(kind: NonTransactionalMessageKind, snapshot: EmailEligibilitySnapshot, now = new Date()) {
  if (snapshot.unsubscribed || snapshot.suppressed) return { allowed: false, reason: 'suppressed' } as const;
  if (snapshot.purchased && PRE_PURCHASE.has(kind)) return { allowed: false, reason: 'purchase' } as const;

  const cutoff = now.getTime() - GLOBAL_NON_TRANSACTIONAL_CAP.windowMs;
  const recentCount = snapshot.recentNonTransactionalSentAt.filter(sent => sent.getTime() >= cutoff && sent.getTime() <= now.getTime()).length;
  if (recentCount >= GLOBAL_NON_TRANSACTIONAL_CAP.max) return { allowed: false, reason: 'frequency_cap' } as const;

  const higherPriorityPending = (snapshot.pendingHigherPriorityKinds ?? []).some(other => MESSAGE_PRIORITY[other] > MESSAGE_PRIORITY[kind]);
  if (higherPriorityPending) return { allowed: false, reason: 'higher_priority_pending' } as const;

  return { allowed: true, reason: 'eligible' } as const;
}

export function sortLifecycleMessages(kinds: readonly NonTransactionalMessageKind[]) {
  return [...kinds].sort((a, b) => MESSAGE_PRIORITY[b] - MESSAGE_PRIORITY[a]);
}
