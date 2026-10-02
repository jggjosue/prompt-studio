import assert from 'node:assert/strict';
import test from 'node:test';
import { trainingEligibilityFromConsent } from '../../src/lib/training-consent';

test('deny-by-default when consent is missing or stale', () => {
  const result = trainingEligibilityFromConsent({
    training: false,
    version: 'not-captured',
    capturedAt: new Date(0),
    source: 'account',
  });
  assert.equal(result.status, 'ineligible');
  assert.deepEqual(result.reasonCodes, ['training_consent_missing_or_stale']);
});

test('valid consent only advances data to pending, never directly eligible', () => {
  const result = trainingEligibilityFromConsent({
    training: true,
    version: '2026-10-v1',
    capturedAt: new Date(),
    source: 'account',
  });
  assert.equal(result.status, 'pending');
  assert.deepEqual(result.reasonCodes, []);
});
