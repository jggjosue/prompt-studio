import assert from 'node:assert/strict';
import test from 'node:test';

import { attributionFromUrl, buildEmailUrl, toSafeAnalyticsParams } from '../../src/lib/email-attribution.ts';

test('email links use consistent attribution and UTMs', () => {
  const result = new URL(buildEmailUrl('https://example.com/create?x=1', {
    campaignId: 'onboarding-01',
    sequenceId: 'welcome',
    lifecycleTrigger: 'registered',
    utmCampaign: 'onboarding',
  }));
  assert.equal(result.searchParams.get('utm_source'), 'email');
  assert.equal(result.searchParams.get('utm_medium'), 'email');
  assert.equal(result.searchParams.get('utm_campaign'), 'onboarding');
  assert.equal(result.searchParams.get('email_campaign'), 'onboarding-01');
  assert.equal(attributionFromUrl(result)?.sequenceId, 'welcome');
});

test('analytics attribution contains no recipient PII', () => {
  const params = toSafeAnalyticsParams({
    campaignId: 'reactivation-01',
    sequenceId: 'inactive-7d',
    lifecycleTrigger: 'inactive_7d',
    utmCampaign: 'reactivation',
  });
  assert.equal('email' in params, false);
  assert.equal('user_id' in params, false);
  assert.equal('recipient' in params, false);
});

test('unsafe attribution tokens are rejected', () => {
  const url = new URL('https://example.com/?email_campaign=a%40example.com&utm_campaign=welcome');
  assert.equal(attributionFromUrl(url), null);
});
