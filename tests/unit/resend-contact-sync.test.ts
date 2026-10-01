import assert from 'node:assert/strict';
import test from 'node:test';

import { resendContactState } from '../../src/lib/resend.ts';

test('Clerk/account presence is not marketing permission', () => {
  assert.deepEqual(resendContactState({ email: ' User@Example.com ' }), {
    email: 'user@example.com',
    unsubscribed: true,
  });
});

test('explicit opt-in creates an eligible subscribed contact', () => {
  assert.equal(resendContactState({ email: 'u@example.com', marketingOptIn: true }).unsubscribed, false);
});

test('suppression wins over opt-in during every import/sync', () => {
  assert.equal(resendContactState({
    email: 'u@example.com',
    marketingOptIn: true,
    emailSuppressionReason: 'complaint',
  }).unsubscribed, true);
  assert.equal(resendContactState({
    email: 'u@example.com',
    marketingOptIn: true,
    emailDoNotContact: true,
  }).unsubscribed, true);
});
