import 'server-only';

import B2BProspect from '@/models/B2BProspect';
import FounderOutreachAttempt from '@/models/FounderOutreachAttempt';
import FounderOutreachCohortReview from '@/models/FounderOutreachCohortReview';
import { canSendInitialFounderOutreach, reviewCheckpoint, type FounderOutreachSegment, type OutreachStage } from '@/lib/founder-b2b-outreach';

const STAGE_FIELD: Record<OutreachStage, string> = {
  sent: 'sentAt', delivered: 'deliveredAt', reply: 'repliedAt',
  positive_reply: 'positiveReplyAt', demo_trial: 'demoTrialAt',
  activation: 'activatedAt', checkout: 'checkoutAt', paid: 'paidAt',
};

export async function createFounderOutreachAttempt(params: {
  prospectId: string; segment: FounderOutreachSegment; personalizationNote: string;
  reviewedBy: string; senderIdentity: string; now?: Date;
}) {
  const prospect = await B2BProspect.findById(params.prospectId).lean();
  if (!prospect || prospect.outreachStatus !== 'qualified') return { created: false as const, reason: 'not_qualified' as const };
  const candidate = {
    prospectId: params.prospectId, segment: params.segment, humanReviewed: true,
    personalizationNote: params.personalizationNote, doNotContact: prospect.doNotContact === true,
    recurringMarketingPermission: false,
  };
  if (!canSendInitialFounderOutreach(candidate)) return { created: false as const, reason: 'send_gate_failed' as const };

  const attempted = await FounderOutreachAttempt.countDocuments({ cohort: 'first_100' });
  const ordinal = attempted + 1;
  if (ordinal > 100) return { created: false as const, reason: 'cohort_complete' as const };
  const previousCheckpoint = Math.floor((ordinal - 1) / 25) * 25;
  if (previousCheckpoint >= 25 && reviewCheckpoint(previousCheckpoint)) {
    const review = await FounderOutreachCohortReview.exists({ cohort: 'first_100', checkpoint: previousCheckpoint });
    if (!review) return { created: false as const, reason: 'checkpoint_review_required' as const, checkpoint: previousCheckpoint };
  }

  const now = params.now ?? new Date();
  const attempt = await FounderOutreachAttempt.create({
    prospectId: params.prospectId, cohort: 'first_100', ordinal, segment: params.segment,
    personalizationNote: params.personalizationNote.trim(), reviewedBy: params.reviewedBy,
    reviewedAt: now, senderIdentity: params.senderIdentity.trim(),
  });
  return { created: true as const, attempt };
}

export async function markFounderOutreachStage(attemptId: string, stage: OutreachStage, at = new Date()) {
  const field = STAGE_FIELD[stage];
  const update: Record<string, Date> = { [field]: at };
  return FounderOutreachAttempt.findByIdAndUpdate(attemptId, { $set: update }, { new: true });
}

export async function recordFounderOutreachLearning(attemptId: string, params: {
  objection?: string | null; requestedOutcome?: string | null; learningNotes?: string | null;
}) {
  return FounderOutreachAttempt.findByIdAndUpdate(attemptId, { $set: params }, { new: true });
}
