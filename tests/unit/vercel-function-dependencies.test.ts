import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = (file: string) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');

test('AI queue defers Genkit until the local Google fallback is selected', async () => {
  const runner = await source('src/lib/ai-job-runner.ts');
  assert.doesNotMatch(runner, /^import .*generate-image/m);
  assert.match(runner, /await import\(['"]@\/ai\/flows\/generate-image['"]\)/);
});

test('shared server helpers defer optional heavyweight clients', async () => {
  const [images, subscriptions, cloudflare] = await Promise.all([
    source('src/lib/image-transcode.ts'),
    source('src/lib/server-subscription-status.ts'),
    source('src/lib/cloudflare-r2.ts'),
  ]);
  assert.doesNotMatch(images, /^import sharp from/m);
  assert.match(images, /await import\(['"]sharp['"]\)/);
  assert.doesNotMatch(subscriptions, /^import \{ stripe/m);
  assert.match(subscriptions, /await import\(['"]@\/lib\/stripe['"]\)/);
  assert.match(cloudflare, /import type Cloudflare from 'cloudflare'/);
  assert.match(cloudflare, /await import\(['"]cloudflare['"]\)/);
});

test('Genkit flows use zod without importing the Genkit barrel for schemas', async () => {
  const flows = await Promise.all([
    'generate-image.ts',
    'generate-image-video-prompts.ts',
    'optimize-prompt.ts',
    'personalize-component.ts',
  ].map(file => source(`src/ai/flows/${file}`)));
  for (const flow of flows) {
    assert.doesNotMatch(flow, /import \{\s*z\s*\} from ['"]genkit['"]/);
    assert.match(flow, /import \{\s*z\s*\} from ['"]zod['"]/);
  }
});
