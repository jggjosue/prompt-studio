import assert from 'node:assert/strict';
import test from 'node:test';
import { anonymizeObservabilityUser, safeErrorCode, sanitizeObservabilityMetadata } from '../../src/lib/observability-safety.ts';

test('la telemetría de generación conserva forma y tamaño sin el contenido', () => {
  const safe = sanitizeObservabilityMetadata({
    operation: 'image_generation', kind: 'image', provider: 'google', modelId: 'imagen-3.0',
    jobId: 'job_123', correlationId: 'job_123', attempts: 3,
    creditsEstimated: 4, creditsState: 'reserved', creditOperation: 'capture',
    mimeType: 'image/png', byteLength: 12_345, base64Length: 16_472, storageKind: 'inline', storageOutcome: 'returned_inline',
    imageData: 'iVBORw0KGgo=', imageUrl: 'data:image/png;base64,iVBORw0KGgo=',
  });

  assert.deepEqual(safe, {
    operation: 'image_generation', kind: 'image', provider: 'google', modelId: 'imagen-3.0',
    jobId: 'job_123', correlationId: 'job_123', attempts: 3,
    creditsEstimated: 4, creditsState: 'reserved', creditOperation: 'capture',
    mimeType: 'image/png', byteLength: 12_345, base64Length: 16_472, storageKind: 'inline', storageOutcome: 'returned_inline',
  });
  assert.ok(!JSON.stringify(safe).includes('iVBORw0KGgo'));
});

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
    email: 'help@prompstudio.com',
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

test('la lista segura conserva diagnóstico del proveedor sin aceptar payloads', () => {
  const safe = sanitizeObservabilityMetadata({
    service: 'google-gemini', host: 'generativelanguage.googleapis.com', endpointLabel: 'v1beta/models/:generateContent',
    modelId: 'gemini-2.0-flash', httpStatus: 400, retryable: false,
    providerErrorCode: 'INVALID_ARGUMENT', providerErrorMessage: 'Unsupported generation config',
    requestBody: 'private', responseBody: 'private', authorization: 'Bearer private',
  });
  assert.deepEqual(safe, {
    service: 'google-gemini', host: 'generativelanguage.googleapis.com', endpointLabel: 'v1beta/models/:generateContent',
    modelId: 'gemini-2.0-flash', httpStatus: 400, retryable: false,
    providerErrorCode: 'INVALID_ARGUMENT', providerErrorMessage: 'Unsupported generation config',
  });
});
