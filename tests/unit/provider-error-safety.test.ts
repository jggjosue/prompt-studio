import assert from 'node:assert/strict';
import test from 'node:test';
import { isRetryableProviderStatus, providerHttpStatus, safeProviderHost, safeProviderResponseError, sanitizeProviderErrorMessage } from '../../src/lib/provider-error-safety';

test('provider error details preserve diagnosis and redact credentials', async () => {
  const response = new Response(JSON.stringify({
    error: { code: 401, status: 'UNAUTHENTICATED', message: 'Authorization: Bearer private-token key=secret-value' },
  }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  const safe = await safeProviderResponseError(response);

  assert.equal(safe.code, 'UNAUTHENTICATED');
  assert.match(safe.message, /\[REDACTED\]/);
  assert.doesNotMatch(safe.message, /private-token|secret-value/);
});

test('provider diagnostics classify status, retryability and hosts safely', () => {
  assert.equal(providerHttpStatus({ $metadata: { httpStatusCode: 400 } }), 400);
  assert.equal(isRetryableProviderStatus(400), false);
  assert.equal(isRetryableProviderStatus(401), false);
  assert.equal(isRetryableProviderStatus(429), true);
  assert.equal(isRetryableProviderStatus(503), true);
  assert.equal(safeProviderHost('https://user:pass@example.com/path?key=secret'), 'example.com');
  assert.equal(sanitizeProviderErrorMessage('token=secret abc'), 'token=[REDACTED] abc');
  assert.doesNotMatch(sanitizeProviderErrorMessage('prompt="private portrait" email@example.com'), /private portrait|email@example\.com/);
});
