import assert from 'node:assert/strict';
import test from 'node:test';
import { ONBOARDING_SEQUENCE, onboardingDestination, renderOnboardingText, shouldSendOnboardingStep } from '../../src/lib/onboarding-lifecycle.ts';

test('onboarding has five ordered lifecycle emails', () => {
  assert.deepEqual(ONBOARDING_SEQUENCE.map(item => item.step), [1, 2, 3, 4, 5]);
  assert.deepEqual(ONBOARDING_SEQUENCE.map(item => item.delayHours), [0, 24, 72, 120, 168]);
});

test('every CTA carries campaign, sequence and UTM attribution', () => {
  for (const step of ONBOARDING_SEQUENCE) {
    const url = new URL(onboardingDestination(step, 'https://prompt.example', 'image'));
    assert.equal(url.searchParams.get('utm_source'), 'email');
    assert.equal(url.searchParams.get('utm_medium'), 'email');
    assert.equal(url.searchParams.get('utm_campaign'), step.campaignId);
    assert.equal(url.searchParams.get('email_sequence'), 'onboarding_v1');
  }
});

test('purchase stops paid conversion steps but not value steps', () => {
  assert.equal(shouldSendOnboardingStep({ step: ONBOARDING_SEQUENCE[2], marketingEligible: true, topicEnabled: true, purchased: true }), true);
  assert.equal(shouldSendOnboardingStep({ step: ONBOARDING_SEQUENCE[3], marketingEligible: true, topicEnabled: true, purchased: true }), false);
});

test('consent and topic preference gate every send', () => {
  assert.equal(shouldSendOnboardingStep({ step: ONBOARDING_SEQUENCE[0], marketingEligible: false, topicEnabled: true, purchased: false }), false);
  assert.equal(shouldSendOnboardingStep({ step: ONBOARDING_SEQUENCE[0], marketingEligible: true, topicEnabled: false, purchased: false }), false);
});

test('plain text includes CTA, preferences and unsubscribe', () => {
  const text = renderOnboardingText(ONBOARDING_SEQUENCE[0], 'https://x/cta', 'https://x/preferences', 'https://x/unsubscribe');
  assert.match(text, /https:\/\/x\/cta/);
  assert.match(text, /Preferencias:/);
  assert.match(text, /Cancelar suscripción:/);
});
