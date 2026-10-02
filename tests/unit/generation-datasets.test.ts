import assert from 'node:assert/strict';
import test from 'node:test';
import { buildGenerationDatasetExample, serializeGenerationJsonl } from '../../src/lib/datasets/generation';

const base = {
  recordId: 'record-1',
  requestId: 'request-1',
  outputId: 'output-1',
  occurredAt: '2026-10-02T00:00:00.000Z',
  payload: { prompt: 'cinematic cat portrait' },
  model: { provider: 'provider-a', model: 'model-a', version: null },
  parameters: { aspectRatio: '16:9' },
  quality: { version: 'quality-v1', score: 0.8, threshold: 0.5, passes: true },
};

test('builds image example with R2 references only', () => {
  const example = buildGenerationDatasetExample({
    ...base,
    modality: 'image',
    assets: [{ provider: 'cloudflare-r2', bucket: 'prompt-studio-ml', key: 'assets/images/a.webp', contentType: 'image/webp', contentHash: 'a'.repeat(64), bytes: 100 }],
  });
  assert.ok(example);
  assert.equal(example?.modality, 'image');
  assert.equal(example?.outputs[0].key, 'assets/images/a.webp');
  assert.equal('body' in (example?.outputs[0] as any), false);
});

test('rejects modality-mismatched asset content type', () => {
  const example = buildGenerationDatasetExample({
    ...base,
    modality: 'video',
    assets: [{ provider: 'cloudflare-r2', bucket: 'prompt-studio-ml', key: 'assets/images/a.webp', contentType: 'image/webp', contentHash: null, bytes: 100 }],
  });
  assert.equal(example, null);
});

test('web accepts html artifact reference', () => {
  const example = buildGenerationDatasetExample({
    ...base,
    modality: 'web',
    assets: [{ provider: 'cloudflare-r2', bucket: 'prompt-studio-ml', key: 'assets/web/page.html', contentType: 'text/html', contentHash: null, bytes: 100 }],
  });
  assert.ok(example);
});

test('quality gate and prompt are mandatory', () => {
  const asset = [{ provider: 'cloudflare-r2' as const, bucket: 'prompt-studio-ml', key: 'assets/images/a.webp', contentType: 'image/webp', contentHash: null, bytes: 100 }];
  assert.equal(buildGenerationDatasetExample({ ...base, modality: 'image', assets: asset, quality: { ...base.quality, passes: false } }), null);
  assert.equal(buildGenerationDatasetExample({ ...base, modality: 'image', assets: asset, payload: {} }), null);
});

test('JSONL and example IDs are deterministic', () => {
  const asset = [{ provider: 'cloudflare-r2' as const, bucket: 'prompt-studio-ml', key: 'assets/images/a.webp', contentType: 'image/webp', contentHash: 'b'.repeat(64), bytes: 100 }];
  const a = buildGenerationDatasetExample({ ...base, modality: 'image', assets: asset })!;
  const b = buildGenerationDatasetExample({ ...base, modality: 'image', assets: [...asset] })!;
  assert.equal(a.exampleId, b.exampleId);
  assert.equal(JSON.parse(serializeGenerationJsonl([a])).schemaVersion, 1);
});
