import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { externalizeGenerationAssets, generationAssetKey } from '../../src/lib/generation-assets';

const png = Buffer.from('89504e470d0a1a0a0000000d49484452', 'hex');
const pngHash = createHash('sha256').update(png).digest('hex');

function recorder() {
  const puts: Array<{ key: string; bytes: Buffer; contentType: string }> = [];
  return { puts, put: async (key: string, bytes: Buffer, contentType: string) => { puts.push({ key, bytes, contentType }); return `https://r2/${key}`; } };
}

test('a data-URL image is moved to a content-addressed R2 key and the result keeps a reference', async () => {
  const r2 = recorder();
  const { result, assets, code } = await externalizeGenerationAssets({
    jobId: 'job1', userId: 'user_a', result: { imageUrl: `data:image/png;base64,${png.toString('base64')}`, mimeType: 'image/png', finishReason: 'STOP' },
  }, { put: r2.put, bucket: 'media' });
  assert.equal(code, null);
  assert.equal(r2.puts.length, 1);
  assert.equal(r2.puts[0].key, `users/user_a/generations/${pngHash}.png`);
  assert.deepEqual(r2.puts[0].bytes, png);
  assert.equal(result?.imageUrl, '/api/ai/jobs/job1/asset');
  assert.equal(result?.imageKey, `users/user_a/generations/${pngHash}.png`);
  assert.deepEqual(assets[0], { provider: 'cloudflare-r2', bucket: 'media', key: `users/user_a/generations/${pngHash}.png`, contentType: 'image/png', contentHash: pngHash, bytes: png.length, kind: 'image' });
  assert.ok(!JSON.stringify(result).includes('base64'), 'no inline bytes remain in the job result');
  assert.equal(result?.finishReason, 'STOP', 'other fields untouched');
});

test('provider prediction arrays and base64 video are externalized too', async () => {
  const r2 = recorder();
  const video = Buffer.from('000000186674797069736f6d', 'hex');
  const { result, assets } = await externalizeGenerationAssets({
    jobId: 'job2', userId: 'user_a',
    result: { predictions: [{ bytesBase64Encoded: png.toString('base64'), mimeType: 'image/png' }], videoBase64: video.toString('base64'), videoMimeType: 'video/mp4' },
  }, { put: r2.put, bucket: 'media' });
  assert.equal(assets.length, 2);
  assert.equal(assets[1].kind, 'video');
  assert.match(String(result?.videoUrl), /\/api\/ai\/jobs\/job2\/asset\?index=1$/);
  assert.equal((result?.predictions as Array<Record<string, unknown>>)[0].bytesBase64Encoded, undefined);
  assert.equal(result?.videoBase64, undefined);
});

test('identical bytes map to the same key (stored once)', async () => {
  const r2 = recorder();
  const input = { imageUrl: `data:image/png;base64,${png.toString('base64')}` };
  const a = await externalizeGenerationAssets({ jobId: 'j1', userId: 'u', result: input }, { put: r2.put, bucket: 'b' });
  const b = await externalizeGenerationAssets({ jobId: 'j2', userId: 'u', result: input }, { put: r2.put, bucket: 'b' });
  assert.equal(a.assets[0].key, b.assets[0].key);
});

test('when R2 is unavailable the inline result is kept so /generate still shows it', async () => {
  const original = { imageUrl: `data:image/png;base64,${png.toString('base64')}` };
  const notConfigured = await externalizeGenerationAssets({ jobId: 'j', userId: 'u', result: original }, { put: async () => null, bucket: 'b' });
  assert.equal(notConfigured.result, original);
  assert.equal(notConfigured.code, 'R2_NOT_CONFIGURED');
  const failing = await externalizeGenerationAssets({ jobId: 'j', userId: 'u', result: original }, { put: async () => { throw new Error('network'); }, bucket: 'b' });
  assert.equal(failing.result, original);
  assert.deepEqual(failing.assets, []);
});

test('remote URLs, text and html results are left alone', async () => {
  const r2 = recorder();
  for (const result of [{ videoUrl: 'https://provider.example/v.mp4' }, { text: 'hello' }, { html: '<p>x</p>' }, null]) {
    const out = await externalizeGenerationAssets({ jobId: 'j', userId: 'u', result: result as Record<string, unknown> | null }, { put: r2.put, bucket: 'b' });
    assert.equal(out.result, result);
  }
  assert.equal(r2.puts.length, 0);
});

test('asset keys validate their inputs', () => {
  assert.throws(() => generationAssetKey('../etc', pngHash, 'image/png'), /INVALID_GENERATION_ASSET_KEY/);
  assert.throws(() => generationAssetKey('u', 'abc', 'image/png'), /INVALID_GENERATION_ASSET_KEY/);
  assert.throws(() => generationAssetKey('u', pngHash, 'application/x-msdownload'), /UNSUPPORTED/);
});
