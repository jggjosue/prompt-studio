import { calculateEmailKpis, type EmailKpiCounts } from '@/lib/email-kpi';

export function buildEmailKpiDashboard(counts: EmailKpiCounts) {
  const metrics = calculateEmailKpis(counts);
  return {
    primary: {
      deliveryRate: metrics.deliveryRate,
      bounceRate: metrics.bounceRate,
      complaintRate: metrics.complaintRate,
      unsubscribeRate: metrics.unsubscribeRate,
      clickThroughRate: metrics.clickThroughRate,
      clickToActivationRate: metrics.clickToActivationRate,
      clickToCheckoutRate: metrics.clickToCheckoutRate,
      clickToPaidRate: metrics.clickToPaidRate,
      attributedRevenueCents: metrics.attributedRevenueCents,
      reactivationRate: metrics.reactivationRate,
      b2bReplyRate: metrics.b2bReplyRate,
      b2bPositiveReplyRate: metrics.b2bPositiveReplyRate,
      b2bDemoTrialRate: metrics.b2bDemoTrialRate,
      b2bPaidRate: metrics.b2bPaidRate,
    },
    secondary: { directionalOpenRate: metrics.directionalOpenRate },
  };
}
