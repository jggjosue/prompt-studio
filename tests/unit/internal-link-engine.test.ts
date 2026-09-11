import assert from 'node:assert/strict';
import test from 'node:test';
import {
  groupInternalLinks,
  rankInternalLinks,
  type InternalLinkDocument,
} from '../../src/lib/seo/internal-link-engine.ts';

const candidates: InternalLinkDocument[] = [
  {
    id: 'prompt-product-photo',
    path: '/prompts/image/product-photography',
    title: 'Product photography prompt',
    kind: 'prompt',
    category: 'image',
    tags: ['product', 'photography', 'lighting'],
    topics: ['image-generation', 'advertising'],
    promptType: 'image',
    tool: 'image-generator',
    intents: ['commercial'],
    popularity: 0.8,
  },
  {
    id: 'tool-image',
    path: '/generate-images',
    title: 'AI image prompt generator',
    kind: 'tool',
    category: 'image',
    tags: ['image', 'prompt'],
    topics: ['image-generation'],
    promptType: 'image',
    tool: 'image-generator',
    intents: ['commercial'],
    popularity: 1,
  },
  {
    id: 'guide-lighting',
    path: '/learn/image-prompt-lighting',
    title: 'How to describe lighting in image prompts',
    kind: 'guide',
    category: 'image',
    tags: ['lighting', 'image'],
    topics: ['image-generation'],
    promptType: 'image',
    intents: ['informational'],
    popularity: 0.4,
  },
  {
    id: 'popular-unrelated',
    path: '/learn/accounting',
    title: 'Popular accounting guide',
    kind: 'guide',
    category: 'finance',
    topics: ['accounting'],
    intents: ['informational'],
    popularity: 1,
  },
  {
    id: 'hidden',
    path: '/internal/search',
    title: 'Internal search',
    kind: 'tool',
    indexable: false,
    popularity: 1,
  },
];

const context = {
  path: '/image-prompts',
  title: 'AI image prompts',
  category: 'image',
  tags: ['product', 'lighting'],
  topics: ['image-generation'],
  promptType: 'image',
  tool: 'image-generator',
  intents: ['commercial'] as const,
};

test('ranks related pages with explicit, deterministic reasons', () => {
  const result = rankInternalLinks({ context: { ...context, intents: [...context.intents] }, candidates });
  assert.deepEqual(result.map(link => link.document.id), [
    'prompt-product-photo',
    'tool-image',
    'guide-lighting',
  ]);
  assert.ok(result[0]?.reasons.includes('same-category'));
  assert.ok(result[0]?.reasons.includes('shared-topic'));
  assert.ok(!result.some(link => link.document.id === 'popular-unrelated'));
  assert.ok(!result.some(link => link.document.id === 'hidden'));
});

test('enforces total and per-kind link budgets', () => {
  const result = rankInternalLinks({
    context: { ...context, intents: [...context.intents] },
    candidates,
    limits: { total: 2, perKind: { prompt: 0, tool: 1, guide: 1 } },
  });
  assert.equal(result.length, 2);
  const groups = groupInternalLinks(result);
  assert.equal(groups.prompt.length, 0);
  assert.equal(groups.tool.length, 1);
  assert.equal(groups.guide.length, 1);
});

test('deduplicates query variants and excludes the current canonical URL', () => {
  const result = rankInternalLinks({
    context: { ...context, intents: [...context.intents] },
    candidates: [
      ...candidates,
      { ...candidates[0]!, id: 'query-copy', path: '/prompts/image/product-photography?ref=home' },
      { ...candidates[0]!, id: 'self', path: '/image-prompts?tag=product' },
    ],
  });
  assert.equal(result.filter(link => link.document.path.includes('product-photography')).length, 1);
  assert.ok(!result.some(link => link.document.id === 'self'));
});
