import assert from 'node:assert/strict';
import test from 'node:test';

import { GUIDED_PRESETS, applyGuidedPreset } from '../../src/lib/chat-guided-presets';

test('offers four plain-language presets for every primary creation mode', () => {
  assert.deepEqual(Object.keys(GUIDED_PRESETS), ['text', 'image', 'video', 'project']);

  for (const presets of Object.values(GUIDED_PRESETS)) {
    assert.equal(presets.length, 4);
    assert.ok(presets.every(preset => preset.label.length > 0 && preset.description.length > 0));
  }
});

test('image and video presets configure several compatible generation details at once', () => {
  const image = applyGuidedPreset({}, GUIDED_PRESETS.image.find(preset => preset.id === 'product')!);
  assert.deepEqual(
    {
      goal: image.imageGoal,
      ratio: image.imageRatio,
      style: image.imageStyle,
      lighting: image.imageLighting,
    },
    { goal: 'product', ratio: '4-3', style: 'photorealistic', lighting: 'studio' }
  );

  const video = applyGuidedPreset({}, GUIDED_PRESETS.video.find(preset => preset.id === 'reel')!);
  assert.deepEqual(
    {
      goal: video.videoGoal,
      aspect: video.videoAspect,
      duration: video.videoDuration,
      motion: video.videoMotion,
      camera: video.videoCamera,
    },
    { goal: 'reel', aspect: '9-16', duration: 8, motion: 'high', camera: 'zoom-in' }
  );
});

test('chat presets provide useful behavior without replacing unrelated user settings', () => {
  const configured = applyGuidedPreset(
    { provider: 'openai', model: 'gpt-4o', imageRatio: '16-9' },
    GUIDED_PRESETS.text.find(preset => preset.id === 'explain')!
  );

  assert.equal(configured.provider, 'openai');
  assert.equal(configured.model, 'gpt-4o');
  assert.equal(configured.imageRatio, '16-9');
  assert.equal(configured.textGoal, 'explain');
  assert.equal(configured.thinkingLevel, 'high');
  assert.match(configured.systemInstruction ?? '', /paso a paso/i);
});

test('web presets keep blue as the default accent and select the requested section', () => {
  for (const preset of GUIDED_PRESETS.project) {
    const configured = applyGuidedPreset({}, preset);
    assert.equal(configured.webColor, 'blue');
    assert.ok(['hero', 'features', 'pricing', 'full-page'].includes(configured.webComponent ?? ''));
  }
});
