export type CohortReviewMetrics = {
  attempted: number;
  delivered: number;
  replies: number;
  positiveReplies: number;
  demoTrials: number;
  activations: number;
  checkouts: number;
  paid: number;
};

export function summarizeOutreachEvidence(metrics: CohortReviewMetrics) {
  const rate = (value: number) => metrics.attempted ? value / metrics.attempted : 0;
  return {
    deliveryRate: rate(metrics.delivered),
    replyRate: rate(metrics.replies),
    positiveReplyRate: rate(metrics.positiveReplies),
    demoTrialRate: rate(metrics.demoTrials),
    activationRate: rate(metrics.activations),
    checkoutRate: rate(metrics.checkouts),
    paidRate: rate(metrics.paid),
  };
}

export function requiresPositioningReview(attempted: number) {
  return attempted > 0 && attempted <= 100 && attempted % 25 === 0;
}
