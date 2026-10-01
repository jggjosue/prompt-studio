import assert from 'node:assert/strict';
import test from 'node:test';
import { OFFICIAL_ANALYTICS_FUNNELS, OFFICIAL_COHORTS, OFFICIAL_FUNNEL_RULES } from '../../src/lib/analytics-funnels';

test('primary official funnel covers acquisition through confirmed purchase', () => {
  assert.deepEqual(OFFICIAL_ANALYTICS_FUNNELS.acquisitionToPurchase, [
    'view_home', 'signup_started', 'sign_up', 'first_activation',
    'view_pricing', 'begin_checkout', 'purchase',
  ]);
});

test('official cohorts use stable canonical anchors', () => {
  assert.equal(OFFICIAL_COHORTS.signupDate.anchorEvent, 'sign_up');
  assert.equal(OFFICIAL_COHORTS.activationDate.anchorEvent, 'first_activation');
  assert.equal(OFFICIAL_COHORTS.payingDate.anchorEvent, 'purchase');
  assert.equal(OFFICIAL_COHORTS.acquisitionSource.grain, 'utm_source');
});

test('official analysis contract fixes timezone, ordering and purchase authority', () => {
  assert.equal(OFFICIAL_FUNNEL_RULES.timezone, 'UTC');
  assert.match(OFFICIAL_FUNNEL_RULES.ordering, /first occurrence/i);
  assert.match(OFFICIAL_FUNNEL_RULES.purchaseSource, /signed Stripe webhook/i);
});
