export const BEHAVIORAL_EMAIL_TRIGGERS = [
  'signup_no_activation_24h',
  'saved_prompt',
  'generated_image',
  'generated_video',
  'generated_web',
  'premium_views_repeated',
  'checkout_started_no_purchase',
  'inactive_7d',
  'inactive_30d',
  'purchase_completed',
] as const;

export type BehavioralEmailTrigger = (typeof BEHAVIORAL_EMAIL_TRIGGERS)[number];

export const BEHAVIORAL_TRIGGER_OBJECTIVES: Record<BehavioralEmailTrigger, string> = {
  signup_no_activation_24h: 'activation',
  saved_prompt: 'first_generation',
  generated_image: 'repeat_image_creation',
  generated_video: 'repeat_video_creation',
  generated_web: 'repeat_web_creation',
  premium_views_repeated: 'checkout',
  checkout_started_no_purchase: 'purchase',
  inactive_7d: 'reactivation',
  inactive_30d: 'reactivation',
  purchase_completed: 'paid_activation',
};

export const SALES_TRIGGERS = new Set<BehavioralEmailTrigger>([
  'premium_views_repeated',
  'checkout_started_no_purchase',
]);

export type TriggerCandidate = {
  userId: string;
  trigger: BehavioralEmailTrigger;
  sourceEventId: string;
  occurredAt: Date;
  purchased?: boolean;
};

export function behavioralTriggerKey(candidate: TriggerCandidate) {
  return `${candidate.userId}:${candidate.trigger}:${candidate.sourceEventId}`;
}

export function shouldProcessBehavioralTrigger(params: {
  candidate: TriggerCandidate;
  alreadyProcessed: boolean;
  sentLifecycleInLast24h: number;
  sentLifecycleInLast7d: number;
}) {
  if (params.alreadyProcessed) return { process: false as const, reason: 'duplicate' as const };
  if (params.candidate.purchased && SALES_TRIGGERS.has(params.candidate.trigger)) {
    return { process: false as const, reason: 'purchase_cancelled_sales_nudge' as const };
  }
  if (params.sentLifecycleInLast24h >= 1 || params.sentLifecycleInLast7d >= 3) {
    return { process: false as const, reason: 'frequency_cap' as const };
  }
  return { process: true as const, reason: 'eligible' as const };
}
