import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateEmailKpis } from '../../src/lib/email-kpi.ts';
import { buildEmailKpiDashboard } from '../../src/lib/email-kpi-dashboard.ts';

const counts = { sent: 100, delivered: 95, bounced: 5, complained: 1, unsubscribed: 2, clicks: 20, activations: 10, checkouts: 5, paid: 4, attributedRevenueCents: 12000, reactivationEligible: 40, reactivated: 8, b2bSent: 25, b2bReplies: 5, b2bPositiveReplies: 3, b2bDemoTrials: 2, b2bPaid: 1, opens: 60 };

test('calculates provider, funnel, revenue, reactivation and B2B KPIs', () => {
  const kpi = calculateEmailKpis(counts);
  assert.equal(kpi.deliveryRate, .95);
  assert.equal(kpi.clickToPaidRate, .2);
  assert.equal(kpi.reactivationRate, .2);
  assert.equal(kpi.b2bReplyRate, .2);
  assert.equal(kpi.attributedRevenueCents, 12000);
});

test('keeps opens secondary and directional', () => {
  const dashboard = buildEmailKpiDashboard(counts);
  assert.equal('directionalOpenRate' in dashboard.primary, false);
  assert.equal(dashboard.secondary.directionalOpenRate, 60 / 95);
});

test('returns zero for metrics without a denominator', () => {
  assert.equal(calculateEmailKpis({ ...counts, clicks: 0, paid: 0 }).clickToPaidRate, 0);
});
