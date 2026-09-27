import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parseGeminiImageResponse } from '../../src/lib/gemini-image-parser';

describe('Gemini image response parser', () => {
  it('parses a valid image response into IMAGE kind', () => {
    const data = {
      candidates: [{
        finishReason: 'STOP',
        content: {
          parts: [{
            inlineData: { mimeType: 'image/png', data: 'iVBORw0KGgo=' },
          }],
        },
      }],
    };
    const result = parseGeminiImageResponse(data);
    assert.strictEqual(result.kind, 'IMAGE');
    assert.strictEqual(result.mimeType, 'image/png');
    assert.strictEqual(result.base64Length, 12);
    assert.ok(result.imageUrl.startsWith('data:image/png;base64,'));
    assert.strictEqual(result.finishReason, 'STOP');
    assert.strictEqual(result.hasText, false);
  });

  it('parses IMAGE with both text and inlineData', () => {
    const data = {
      candidates: [{
        finishReason: 'STOP',
        content: {
          parts: [
            { text: 'Here is your image.' },
            { inlineData: { mimeType: 'image/jpeg', data: 'abc123' } },
          ],
        },
      }],
    };
    const result = parseGeminiImageResponse(data);
    assert.strictEqual(result.kind, 'IMAGE');
    assert.strictEqual(result.hasText, true);
    assert.strictEqual(result.base64Length, 6);
  });

  it('returns NO_IMAGE for text-only response', () => {
    const data = {
      candidates: [{
        finishReason: 'STOP',
        content: {
          parts: [{ text: 'I cannot generate an image.' }],
        },
      }],
    };
    const result = parseGeminiImageResponse(data);
    assert.strictEqual(result.kind, 'NO_IMAGE');
    assert.strictEqual(result.hasText, true);
    assert.strictEqual(result.finishReason, 'STOP');
  });

  it('returns NO_IMAGE for empty candidates', () => {
    const data = { candidates: [] };
    const result = parseGeminiImageResponse(data);
    assert.strictEqual(result.kind, 'NO_IMAGE');
    assert.strictEqual(result.hasText, false);
    assert.strictEqual(result.finishReason, null);
  });

  it('returns NO_IMAGE for malformed response with no candidates', () => {
    const result = parseGeminiImageResponse({});
    assert.strictEqual(result.kind, 'NO_IMAGE');
    assert.strictEqual(result.hasText, false);
    assert.strictEqual(result.finishReason, null);
  });

  it('returns NO_IMAGE for candidate with empty parts', () => {
    const data = {
      candidates: [{
        finishReason: 'SAFETY',
        content: { parts: [] },
      }],
    };
    const result = parseGeminiImageResponse(data);
    assert.strictEqual(result.kind, 'NO_IMAGE');
    assert.strictEqual(result.finishReason, 'SAFETY');
    assert.strictEqual(result.hasText, false);
  });
});
