import assert from 'node:assert/strict';
import test from 'node:test';
import { parseGeneratedImageSource } from '../../src/lib/generated-image-source';

test('generated image source accepts data URLs, raw base64 and HTTPS', () => {
  const data = parseGeneratedImageSource(' data:image/png;base64,aGVsbG8= ');
  assert.equal(data.kind, 'inline');
  if (data.kind === 'inline') assert.equal(data.buffer.toString(), 'hello');

  const raw = parseGeneratedImageSource(Buffer.alloc(200, 7).toString('base64'));
  assert.equal(raw.kind, 'inline');

  assert.deepEqual(parseGeneratedImageSource('https://cdn.example.com/image.png'), {
    kind: 'remote', url: 'https://cdn.example.com/image.png',
  });
});

test('generated image source returns an actionable error for malformed values', () => {
  assert.throws(() => parseGeneratedImageSource('not an image URL'), /URL no válida/);
});
