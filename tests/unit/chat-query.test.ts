import { parseGenerateQuery } from '@/lib/chat-query';
import assert from 'node:assert/strict';
import test from 'node:test';

test('parses a plain prompt without changing the selected mode', () => {
  assert.deepEqual(parseGenerateQuery('A cinematic portrait'), {
    prompt: 'A cinematic portrait',
    mode: 'image',
    params: {},
  });
});

test('parses serialized prompts from catalog links and preserves configuration', () => {
  const value = encodeURIComponent(JSON.stringify({
    type: 'video',
    title: 'Neon city',
    description: 'A neon city at night',
    imageUrl: 'data:image/png;base64,reference',
    params: { videoDuration: 6, videoAspect: '9-16' },
  }));

  assert.deepEqual(parseGenerateQuery(value), {
    prompt: 'A neon city at night',
    mode: 'video',
    params: {
      videoDuration: 6,
      videoAspect: '9-16',
      referenceImage: 'data:image/png;base64,reference',
    },
  });
});