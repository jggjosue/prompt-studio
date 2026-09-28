import assert from 'node:assert/strict';
import test from 'node:test';
import {
  probeGoogleImageModel,
  safeGoogleError,
  selectGoogleCredential,
} from '../../scripts/ts/verify-gemini-production';
import {
  GOOGLE_IMAGE_API_VERSION,
  GOOGLE_IMAGE_MODEL,
  RETIRED_GOOGLE_IMAGE_MODELS,
} from '../../src/lib/google-image-config';
import { AI_MODEL_CONFIG } from '../../src/lib/ai-credit-config';
import { MODEL_TIERS } from '../../src/lib/models-data';

test('production image model is current and every UI tier resolves to it', () => {
  assert.equal(GOOGLE_IMAGE_API_VERSION, 'v1');
  assert.equal(GOOGLE_IMAGE_MODEL, 'gemini-3.1-flash-image');
  assert.equal(RETIRED_GOOGLE_IMAGE_MODELS.has(GOOGLE_IMAGE_MODEL), false);
  for (const tier of MODEL_TIERS.image.tiers) {
    assert.equal(AI_MODEL_CONFIG[`google:${tier.modelId}`]?.modelId, GOOGLE_IMAGE_MODEL);
  }
});

test('credential selection never returns a conflicting secret', () => {
  assert.deepEqual(selectGoogleCredential({}), { ok: false, reason: 'missing' });
  assert.deepEqual(
    selectGoogleCredential({ GEMINI_API_KEY: 'one', GOOGLE_API_KEY: 'two' }),
    { ok: false, reason: 'conflicting' },
  );
  const selected = selectGoogleCredential({ GEMINI_API_KEY: 'secret-value' });
  assert.equal(selected.ok, true);
  if (selected.ok) assert.equal(selected.name, 'GEMINI_API_KEY');
});

test('provider errors expose only allow-listed diagnostic fields', () => {
  const safe = safeGoogleError({
    error: {
      status: 'INVALID_ARGUMENT',
      message: 'API key secret-value is invalid',
      details: [{ reason: 'API_KEY_INVALID', metadata: { service: 'generativelanguage.googleapis.com', key: 'secret-value' } }],
    },
  });
  assert.deepEqual(safe, {
    providerStatus: 'INVALID_ARGUMENT',
    providerReason: 'API_KEY_INVALID',
    providerService: 'generativelanguage.googleapis.com',
  });
  assert.equal(JSON.stringify(safe).includes('secret-value'), false);
});

test('credential probe sends the key in a header, never in the URL', async () => {
  let requestedUrl = '';
  let requestedHeaders: HeadersInit | undefined;
  const fakeFetch: typeof fetch = async (input, init) => {
    requestedUrl = String(input);
    requestedHeaders = init?.headers;
    return new Response(JSON.stringify({ name: `models/${GOOGLE_IMAGE_MODEL}` }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  const result = await probeGoogleImageModel('private-key', fakeFetch);
  assert.equal(result.ok, true);
  assert.equal(requestedUrl.includes('private-key'), false);
  assert.deepEqual(requestedHeaders, { 'x-goog-api-key': 'private-key' });
});
