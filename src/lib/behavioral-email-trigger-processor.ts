import 'server-only';

import {
  BEHAVIORAL_TRIGGER_OBJECTIVES,
  behavioralTriggerKey,
  shouldProcessBehavioralTrigger,
  type TriggerCandidate,
} from '@/lib/behavioral-email-triggers';
import BehavioralEmailTriggerEvent from '@/models/BehavioralEmailTriggerEvent';

const DAY = 24 * 60 * 60 * 1000;

export async function processBehavioralTrigger(candidate: TriggerCandidate, now = new Date()) {
  const idempotencyKey = behavioralTriggerKey(candidate);
  const existing = await BehavioralEmailTriggerEvent.findOne({ idempotencyKey }).select({ _id: 1 }).lean();
  if (existing) return { processed: false as const, reason: 'duplicate' as const };

  const [sent24h, sent7d] = await Promise.all([
    BehavioralEmailTriggerEvent.countDocuments({ userId: candidate.userId, outcome: 'sent', processedAt: { $gte: new Date(now.getTime() - DAY) } }),
    BehavioralEmailTriggerEvent.countDocuments({ userId: candidate.userId, outcome: 'sent', processedAt: { $gte: new Date(now.getTime() - 7 * DAY) } }),
  ]);

  const decision = shouldProcessBehavioralTrigger({
    candidate,
    alreadyProcessed: false,
    sentLifecycleInLast24h: sent24h,
    sentLifecycleInLast7d: sent7d,
  });

  const outcome =
    decision.reason === 'frequency_cap' ? 'skipped_frequency_cap' :
    decision.reason === 'purchase_cancelled_sales_nudge' ? 'cancelled_purchase' :
    decision.process ? 'sent' : 'ineligible';

  try {
    const event = await BehavioralEmailTriggerEvent.create({
      userId: candidate.userId,
      trigger: candidate.trigger,
      sourceEventId: candidate.sourceEventId,
      idempotencyKey,
      objective: BEHAVIORAL_TRIGGER_OBJECTIVES[candidate.trigger],
      occurredAt: candidate.occurredAt,
      processedAt: now,
      outcome,
    });
    return { processed: decision.process, reason: decision.reason, eventId: String(event._id) };
  } catch (error) {
    // A concurrent worker may have inserted the same unique idempotency key.
    if ((error as { code?: number }).code === 11000) return { processed: false as const, reason: 'duplicate' as const };
    throw error;
  }
}
