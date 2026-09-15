import assert from 'node:assert/strict';
import test from 'node:test';
import { anonymizeObservabilityUser, safeErrorCode, sanitizeObservabilityMetadata } from '../../src/lib/observability-safety.ts';

test('el usuario se anonimiza de forma estable y no reversible en el evento', () => {
  const first = anonymizeObservabilityUser('user_private_123');
  assert.equal(first, anonymizeObservabilityUser('user_private_123'));
  assert.match(first ?? '', /^usr_[a-f0-9]{20}$/);
  assert.ok(!first?.includes('private'));
  assert.notEqual(first, anonymizeObservabilityUser('user_private_456'));
});

test('la observabilidad elimina prompts, credenciales y datos personales', () => {
  const safe = sanitizeObservabilityMetadata({
    provider: 'openai',
    operation: 'generate_image',
    durationMs: 123,
    jobId: 'job_123',
    correlationId: 'job_123',
    prompt: 'retrato privado',
    apiKey: 'sk-secret',
    authorization: 'Bearer secret',
    email: 'private@example.com',
    responseBody: { private: true },
    arbitraryPayload: 'not allowlisted',
  });

  assert.deepEqual(safe, {
    provider: 'openai',
    operation: 'generate_image',
    jobId: 'job_123',
    correlationId: 'job_123',
  });
  assert.ok(!JSON.stringify(safe).includes('privado'));
  assert.ok(!JSON.stringify(safe).includes('secret'));
});

test('el código de error conserva clasificación sin guardar el mensaje', () => {
  const error = Object.assign(new Error('prompt and credential must stay private'), { code: 'RATE_LIMITED' });
  assert.equal(safeErrorCode(error), 'RATE_LIMITED');
  assert.equal(safeErrorCode(new Error('private payload')), 'Error');
});
