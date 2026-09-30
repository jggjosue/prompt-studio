import { stripReferenceMedia } from '@/lib/reference-media-strip';
import assert from 'node:assert/strict';
import test from 'node:test';

test('keeps a plain image-generation input untouched', () => {
  const input = {
    prompt: 'A cinematic portrait',
    model: 'nano-banana-2',
    aspectRatio: '1:1',
    numberOfImages: 1,
    outputMimeType: 'image/png',
    negativePrompt: 'blurry',
  };
  assert.deepEqual(stripReferenceMedia(input), input);
});

test('removes reference image fields so the Google image model never rejects them', () => {
  const input = {
    prompt: 'Edit this photo',
    model: 'nano-banana-2',
    referenceImage: 'data:image/png;base64,AAAA',
    imageBase64: 'AAAA',
    media: { url: 'data:image/png;base64,BBBB' },
    negativePrompt: 'blurry',
  };
  assert.deepEqual(stripReferenceMedia(input), {
    prompt: 'Edit this photo',
    model: 'nano-banana-2',
    negativePrompt: 'blurry',
  });
});

test('does not mutate the original input object', () => {
  const input = { prompt: 'Keep', referenceImage: 'data:image/png;base64,AAAA' };
  stripReferenceMedia(input);
  assert.ok('referenceImage' in input);
});