import assert from 'node:assert/strict';
import test from 'node:test';
import images from '../../src/data/prompts/placeholder-images.json' with { type: 'json' };
import { serializeCatalogPrompt } from '../../src/lib/catalog-prompt.ts';

test('serializa el JSON completo y localizado de Forest Spirit', () => {
  const item = images.placeholderImages.find(entry => entry.title.en === 'Forest Spirit');
  assert.ok(item);

  const prompt = serializeCatalogPrompt(item, 'en');
  const parsed = JSON.parse(prompt);

  assert.equal(parsed.title, 'Forest Spirit');
  assert.equal(
    parsed.description,
    'A mystical creature made of leaves and branches moving through an ancient forest.'
  );
  assert.equal(parsed.imageHint, 'forest spirit');
  assert.equal(parsed.type, 'video');
  assert.deepEqual(parsed.tags, item.tags.filter(tag => typeof tag === 'string'));
  assert.equal('imageUrl' in parsed, false);
  assert.equal('membership' in parsed, false);
});

test('el query param conserva el JSON completo después de URLSearchParams', () => {
  const prompt = JSON.stringify({ description: '100% bosque', tags: ['A&B'] }, null, 2);
  const href = `/generate?prompt=${encodeURIComponent(prompt)}`;

  assert.equal(new URL(href, 'https://prompstudio.com').searchParams.get('prompt'), prompt);
});
