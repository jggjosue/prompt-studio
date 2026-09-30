import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { assessManualActionRisk, selectRelatedGalleryItems, type GalleryItem } from '../../src/lib/gallery-detail.ts';

const item = (id: string, tags: string[], overrides: Partial<GalleryItem> = {}): GalleryItem => ({
  id,
  title: id,
  description: 'A sufficiently descriptive prompt with enough useful words to explain the intended visual output, composition, lighting, subject, style, framing, colors, background, atmosphere, rendering quality, camera perspective, details, constraints, and expected result for a reliable generation workflow.',
  imageUrl: `/images/${id}.webp`,
  imageHint: tags.join(' '),
  type: 'image',
  tags,
  ...overrides,
});

test('selecciona solo tres relacionados del mismo tipo y prioriza etiquetas compartidas', () => {
  const current = item('current', ['portrait', 'cinematic']);
  const candidates = [
    item('weak', ['abstract']),
    item('best', ['portrait', 'cinematic']),
    item('good', ['portrait']),
    item('video', ['portrait', 'cinematic'], { type: 'video' }),
    item('empty', ['portrait'], { imageUrl: '' }),
    item('third', ['cinematic']),
  ];
  const result = selectRelatedGalleryItems(current, candidates);

  assert.deepEqual(result.map(candidate => candidate.id), ['best', 'good', 'third']);
});

test('el orden de relacionados es estable y respeta el límite', () => {
  const current = item('current', ['portrait']);
  const candidates = [item('a', ['other']), item('b', ['other']), item('c', ['other'])];
  assert.deepEqual(
    selectRelatedGalleryItems(current, candidates, 2).map(candidate => candidate.id),
    selectRelatedGalleryItems(current, candidates, 2).map(candidate => candidate.id)
  );
  assert.equal(selectRelatedGalleryItems(current, candidates, 0).length, 0);
});

test('tolera metadata heredada con valores nulos', () => {
  const current = item('current', ['portrait']);
  const legacy = item('legacy', [], { imageHint: null as unknown as string });
  (legacy.tags as unknown[]) = [null, 'portrait'];

  assert.deepEqual(selectRelatedGalleryItems(current, [legacy]).map(candidate => candidate.id), ['legacy']);
});

test('evalúa contenido corto y títulos duplicados sin depender del catálogo cliente', () => {
  const current = item('current', ['portrait'], { title: 'Same title', description: 'short prompt' });
  const risk = assessManualActionRisk(current, [current, item('duplicate', [], { title: ' same TITLE ' })]);

  assert.equal(risk.hasLowValueContent, true);
  assert.equal(risk.hasDuplicateTitle, true);
  assert.equal(risk.duplicateCount, 2);
  assert.equal(risk.hasRisk, true);
});

test('las fichas de /gallery ocultan las estimaciones de tiempo y costo', () => {
  const source = readFileSync(
    new URL('../../src/app/[locale]/gallery/[id]/gallery-detail-client.tsx', import.meta.url),
    'utf8'
  );
  assert.match(source, /PromptValidationCard[^>]+showEstimates=\{false\}/);
});

test('la ruta de imagen no redirige por metadata type heredada', () => {
  const source = readFileSync(
    new URL('../../src/app/[locale]/gallery/[id]/page.tsx', import.meta.url),
    'utf8'
  );

  assert.match(source, /if \(!imageItem && videoItem\)/);
  assert.doesNotMatch(source, /if \(item\.type === ['"]video['"]\)/);
  assert.match(source, /\{ \.\.\.imageItem, type: ['"]image['"] \}/);
});

test('la limpieza del service worker no fuerza una segunda carga', () => {
  const source = readFileSync(
    new URL('../../src/components/service-worker-register.tsx', import.meta.url),
    'utf8'
  );

  assert.doesNotMatch(source, /window\.location\.reload\(\)/);
});
