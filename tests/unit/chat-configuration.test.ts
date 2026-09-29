import assert from 'node:assert/strict';
import test from 'node:test';
import { buildConfiguredImagePrompt, selectedChatConfiguration } from '../../src/lib/chat-configuration';

test('image prompt includes the description and every selected visible setting', () => {
  const params = {
    model: 'nano-banana-pro', imageRatio: '16-9', imageStyle: 'watercolor',
    imageLighting: 'neon', imageCamera: 'aerial', imageFormat: 'webp',
    imageRes: '2k', imageNegative: 'texto, manos deformes',
  };
  const prompt = buildConfiguredImagePrompt('Un perro caminando', params);

  assert.match(prompt, /^Un perro caminando/);
  for (const expected of ['nano-banana-pro', '16:9', 'Acuarela', 'Neón', 'Vista aérea', 'WEBP', '2K', 'texto, manos deformes']) {
    assert.ok(prompt.includes(expected), `falta la configuración ${expected}`);
  }
  assert.equal(selectedChatConfiguration('image', params).length, 8);
});

test('configuration summary fills the same defaults shown by the controls', () => {
  const summary = selectedChatConfiguration('image', {});
  assert.deepEqual(summary.slice(0, 5).map(item => item.value), [
    'nano-banana-2', '1:1', 'Cinematográfico', 'Volumétrica', 'A nivel de ojos',
  ]);
});
