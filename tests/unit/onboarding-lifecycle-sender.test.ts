import assert from 'node:assert/strict';
import test from 'node:test';
import { canSendNonTransactional } from '../../src/lib/email-suppression.ts';
import { ONBOARDING_SEQUENCE, shouldSendOnboardingStep } from '../../src/lib/onboarding-lifecycle.ts';

test('suppression and do-not-contact prevent lifecycle onboarding', () => {
  assert.equal(canSendNonTransactional({ marketingOptIn: true, emailDoNotContact: true }, 'lifecycle'), false);
  assert.equal(canSendNonTransactional({ marketingOptIn: true, emailSuppressionReason: 'complaint' }, 'lifecycle'), false);
});

test('offer steps require offers topic and stop after purchase', () => {
  const step = ONBOARDING_SEQUENCE[4];
  assert.equal(step.topic, 'offers');
  assert.equal(shouldSendOnboardingStep({ step, marketingEligible: true, topicEnabled: true, purchased: true }), false);
  assert.equal(shouldSendOnboardingStep({ step, marketingEligible: true, topicEnabled: false, purchased: false }), false);
});
