import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

test('los formularios muestran el preview interactivo desde la carga', () => {
  const source = readFileSync(
    new URL('../../src/components/static-component-preview.tsx', import.meta.url),
    'utf8'
  );

  assert.match(
    source,
    /liveByDefault \|\| type === ['"]form['"] \|\| isHovered/
  );
  assert.match(source, /opacity: showLivePreview \? 1 : 0/);
  assert.match(source, /pointerEvents: showLivePreview \? ['"]auto['"] : ['"]none['"]/);
});
