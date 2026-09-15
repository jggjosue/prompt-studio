import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { getRelatedHubLinks } from '../../src/lib/internal-link-graph.ts';

const metadataFiles = [
  'src/app/[locale]/layout.tsx',
  'src/app/[locale]/image-prompts/page.tsx',
  'src/app/[locale]/video-prompts/page.tsx',
  'src/app/[locale]/generate-images/page.tsx',
  'src/app/[locale]/prices/page.tsx',
];

test('la metadata principal no recupera búsquedas editoriales irrelevantes', () => {
  const source = metadataFiles.map(file => readFileSync(file, 'utf8')).join('\n');
  for (const term of ['chatgpt go bbva', 'chatgpt adult mode', 'voicemail prompts crossword', 'chatgpt health']) {
    assert.ok(!source.toLowerCase().includes(term), `Término irrelevante encontrado: ${term}`);
  }
});

test('los enlaces relacionados siguen la intención descubrir → crear', () => {
  assert.deepEqual(
    getRelatedHubLinks('/image-prompts', 3).map(link => link.path),
    ['/generate-images', '/image-tags', '/prompts']
  );
  assert.deepEqual(
    getRelatedHubLinks('/video-prompts', 3).map(link => link.path),
    ['/generate-videos', '/video-tags', '/prompts']
  );
  assert.deepEqual(
    getRelatedHubLinks('/landing-pages', 4).map(link => link.path),
    ['/generate-webs', '/web-tags', '/component-builder', '/component-kits']
  );
});
