import assert from 'node:assert/strict';
import test from 'node:test';
import {
  classifyGeminiSmokeFailure,
  validateGeminiSmokeImage,
} from '../../src/lib/gemini-image-smoke';
import {
  GoogleImageProviderError,
  requestGoogleImage,
} from '../../src/lib/google-image-provider';
import { googleImageModelFor } from '../../src/lib/google-image-config';

function dataUrl(mimeType: string, signature: number[]) {
  const bytes = Buffer.alloc(64);
  Buffer.from(signature).copy(bytes);
  return `data:${mimeType};base64,${bytes.toString('base64')}`;
}

test('smoke test accepts real image signatures and reports decoded bytes', () => {
  const image = validateGeminiSmokeImage(dataUrl('image/png', [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  assert.equal(image.mimeType, 'image/png');
  assert.equal(image.byteLength, 64);
  assert.match(image.dataUrl, /^data:image\/png;base64,/);
});

test('smoke test rejects base64 that is not valid image bytes', () => {
  assert.throws(
    () => validateGeminiSmokeImage(dataUrl('image/png', [0x00, 0x01, 0x02])),
    /formato de imagen permitido/,
  );
  assert.throws(
    () => validateGeminiSmokeImage(dataUrl('image/jpeg', [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
    /formato de imagen permitido/,
  );
});

test('provider failures expose actionable categories without raw payloads', () => {
  assert.deepEqual(classifyGeminiSmokeFailure(Object.assign(new Error('provider denied'), { status: 401, code: 'UNAUTHENTICATED' })), {
    category: 'AUTH_OR_PERMISSION',
    httpStatus: 401,
    code: 'UNAUTHENTICATED',
    retryable: false,
  });
  assert.equal(classifyGeminiSmokeFailure(Object.assign(new Error('quota'), { status: 429 })).category, 'RATE_LIMIT_OR_QUOTA');
  assert.equal(classifyGeminiSmokeFailure(Object.assign(new Error('missing image'), { code: 'NO_IMAGE' })).category, 'NO_IMAGE');
});

test('shared provider uses canonical v1 endpoint and keeps the key out of the URL', async () => {
  let requestedUrl = '';
  let requestedHeaders: HeadersInit | undefined;
  const png = Buffer.alloc(64);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(png);
  const fetchImpl: typeof fetch = async (input, init) => {
    requestedUrl = String(input);
    requestedHeaders = init?.headers;
    return new Response(JSON.stringify({
      candidates: [{ content: { parts: [{ inlineData: { mimeType: 'image/png', data: png.toString('base64') } }] } }],
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };

  const response = await requestGoogleImage({ prompt: 'orange cat', apiKey: 'private-key', fetchImpl });
  assert.match(requestedUrl, /\/v1\/models\/gemini-3\.1-flash-image:generateContent$/);
  assert.equal(requestedUrl.includes('private-key'), false);
  assert.equal((requestedHeaders as Record<string, string>)['x-goog-api-key'], 'private-key');
  assert.equal(response.result.kind, 'IMAGE');
});

test('shared provider preserves safe HTTP and provider codes on failure', async () => {
  const fetchImpl: typeof fetch = async () => new Response(JSON.stringify({
    error: { status: 'RESOURCE_EXHAUSTED', message: 'quota exceeded secret-value' },
  }), { status: 429, headers: { 'Content-Type': 'application/json' } });

  await assert.rejects(
    requestGoogleImage({ prompt: 'orange cat', apiKey: 'private-key', fetchImpl }),
    (error: unknown) => {
      assert.ok(error instanceof GoogleImageProviderError);
      assert.equal(error.status, 429);
      assert.equal(error.code, 'RESOURCE_EXHAUSTED');
      assert.equal(error.message.includes('secret-value'), false);
      assert.equal(classifyGeminiSmokeFailure(error).category, 'RATE_LIMIT_OR_QUOTA');
      return true;
    },
  );
});

test('image quality aliases route to distinct Google models', () => {
  assert.equal(googleImageModelFor('nano-banana-2-lite'), 'gemini-3.1-flash-lite-image');
  assert.equal(googleImageModelFor('nano-banana-2'), 'gemini-3.1-flash-image');
  assert.equal(googleImageModelFor('nano-banana-pro'), 'gemini-3-pro-image');
});
