import test from 'node:test';
import assert from 'node:assert/strict';

const { quoteVideoProviderCost } = await import('../../src/lib/provider-pricing-registry.ts');

test('Gemini Veo Lite scales credits by duration', () => {
  assert.equal(quoteVideoProviderCost({ provider: 'google', modelId: 'veo-3.1-lite-generate-preview', resolution: '720p', durationSeconds: 4 })?.requiredCredits, 90);
  assert.equal(quoteVideoProviderCost({ provider: 'google', modelId: 'veo-3.1-lite-generate-preview', resolution: '720p', durationSeconds: 6 })?.requiredCredits, 135);
  assert.equal(quoteVideoProviderCost({ provider: 'google', modelId: 'veo-3.1-lite-generate-preview', resolution: '720p', durationSeconds: 8 })?.requiredCredits, 180);
});

test('Gemini Veo Fast scales credits by resolution', () => {
  assert.equal(quoteVideoProviderCost({ provider: 'google', modelId: 'veo-3.1-fast-generate-preview', resolution: '720p', durationSeconds: 8 })?.requiredCredits, 360);
  assert.equal(quoteVideoProviderCost({ provider: 'google', modelId: 'veo-3.1-fast-generate-preview', resolution: '1080p', durationSeconds: 8 })?.requiredCredits, 432);
  assert.equal(quoteVideoProviderCost({ provider: 'google', modelId: 'veo-3.1-fast-generate-preview', resolution: '4k', durationSeconds: 8 })?.requiredCredits, 1080);
});

test('Vertex distinguishes audio and video-only economics', () => {
  assert.equal(quoteVideoProviderCost({ provider: 'vertex', modelId: 'veo-3.1-lite-generate-001', resolution: '720p', durationSeconds: 8, audio: true })?.requiredCredits, 180);
  assert.equal(quoteVideoProviderCost({ provider: 'vertex', modelId: 'veo-3.1-lite-generate-001', resolution: '720p', durationSeconds: 8, audio: false })?.requiredCredits, 108);
});

test('higher-resolution Veo requires an eight-second clip', () => {
  assert.throws(() => quoteVideoProviderCost({ provider: 'google', modelId: 'veo-3.1-fast-generate-preview', resolution: '1080p', durationSeconds: 6 }), /VIDEO_DURATION_RESOLUTION_UNSUPPORTED/);
});
