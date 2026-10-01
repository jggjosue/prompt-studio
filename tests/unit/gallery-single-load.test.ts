import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const source = (file: string) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');

test('image detail mounts its above-the-fold image without an observer remount', async () => {
  const detail = await source('src/app/[locale]/gallery/[id]/gallery-detail-client.tsx');

  assert.match(detail, /lazyAdaptive=\{false\}/);
  assert.doesNotMatch(detail, /\bpriority\b/);
});

test('video detail loads the main media once without an automatic preview seek', async () => {
  const detail = await source('src/app/[locale]/gallery-videos/[id]/gallery-video-detail-client.tsx');

  assert.match(detail, /poster=\{poster\}[\s\S]*?eager[\s\S]*?previewSeek=\{false\}[\s\S]*?preload="metadata"/);
  assert.match(detail, /src=\{other\.imageUrl\}[\s\S]*?preload="none"/);
});

test('lazy videos remain mounted after their first intersection', async () => {
  const video = await source('src/components/lazy-video.tsx');

  assert.match(video, /kind: 'video',[\s\S]*?once: true/);
  assert.match(video, /if \(previewSeek && !previewSeekApplied\.current/);
});
