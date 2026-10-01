export type EmailKpiCounts = {
  sent: number; delivered: number; bounced: number; complained: number; unsubscribed: number;
  clicks: number; activations: number; checkouts: number; paid: number; attributedRevenueCents: number;
  reactivationEligible: number; reactivated: number;
  b2bSent: number; b2bReplies: number; b2bPositiveReplies: number; b2bDemoTrials: number; b2bPaid: number;
  opens?: number;
};

const ratio = (numerator: number, denominator: number) => denominator > 0 ? numerator / denominator : 0;

export function calculateEmailKpis(c: EmailKpiCounts) {
  return {
    deliveryRate: ratio(c.delivered, c.sent),
    bounceRate: ratio(c.bounced, c.sent),
    complaintRate: ratio(c.complained, c.delivered),
    unsubscribeRate: ratio(c.unsubscribed, c.delivered),
    clickThroughRate: ratio(c.clicks, c.delivered),
    clickToActivationRate: ratio(c.activations, c.clicks),
    clickToCheckoutRate: ratio(c.checkouts, c.clicks),
    clickToPaidRate: ratio(c.paid, c.clicks),
    attributedRevenueCents: c.attributedRevenueCents,
    reactivationRate: ratio(c.reactivated, c.reactivationEligible),
    b2bReplyRate: ratio(c.b2bReplies, c.b2bSent),
    b2bPositiveReplyRate: ratio(c.b2bPositiveReplies, c.b2bSent),
    b2bDemoTrialRate: ratio(c.b2bDemoTrials, c.b2bSent),
    b2bPaidRate: ratio(c.b2bPaid, c.b2bSent),
    directionalOpenRate: c.opens === undefined ? null : ratio(c.opens, c.delivered),
  };
}

export const EMAIL_KPI_SOURCE_MAP = {
  delivery: 'Resend provider events',
  bounce: 'Resend provider events',
  complaint: 'Resend provider events',
  unsubscribe: 'email preference/suppression events',
  clicks: 'email attribution/product events',
  activation: 'product funnel events',
  checkout: 'product/Stripe checkout attribution',
  paid: 'Stripe purchase attribution',
  revenue: 'Stripe purchase attribution',
  b2b: 'founder outreach attempts',
} as const;
