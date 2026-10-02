import assert from 'node:assert/strict';
import test from 'node:test';
import { sanitizeTrainingValue, TRAINING_SANITIZER_VERSION } from '../../src/lib/training-sanitizer';

test('redacts common contact PII deterministically', () => {
  const result = sanitizeTrainingValue({ text: 'Contact jane@example.com or +1 (415) 555-0123 from 192.168.1.10' });
  assert.equal(result.accepted, true);
  if (!result.accepted) return;
  const text = (result.value as any).text;
  assert.match(text, /REDACTED_EMAIL/);
  assert.match(text, /REDACTED_PHONE/);
  assert.match(text, /REDACTED_IP/);
  assert.equal(text.includes('jane@example.com'), false);
  assert.equal(result.version, TRAINING_SANITIZER_VERSION);
});

test('rejects recognized credentials without returning them in rejection metadata', () => {
  const secret = 'sk-proj-abcdefghijklmnopqrstuvwxyz123456';
  const result = sanitizeTrainingValue({ message: `token ${secret}` });
  assert.equal(result.accepted, false);
  if (result.accepted) return;
  assert.deepEqual(result.reasonCodes, ['secret_detected']);
  assert.equal(JSON.stringify(result).includes(secret), false);
});

test('rejects credential-shaped fields even when value pattern is unknown', () => {
  const result = sanitizeTrainingValue({ nested: { apiKey: 'vendor-specific-value' } });
  assert.equal(result.accepted, false);
  if (result.accepted) return;
  assert.ok(result.reasonCodes.includes('high_risk_pii_detected'));
});

test('rejects oversized JSON before processing', () => {
  const result = sanitizeTrainingValue({ text: 'x'.repeat(300 * 1024) });
  assert.equal(result.accepted, false);
  if (result.accepted) return;
  assert.deepEqual(result.reasonCodes, ['payload_too_large']);
});
