import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildProductSchema,
  buildVideoObjectSchema,
  safeJsonLd,
} from '../../src/lib/json-ld.ts';

test('FAQ schema is opt-in and only includes visible answers', () => {
  const items = [
    { question: 'Visible?', answer: 'Yes.', visible: true },
    { question: 'Hidden?', answer: 'No.', visible: false },
  ];
  assert.equal(buildFaqSchema({ eligible: false, items }), null);
  const schema = buildFaqSchema({ eligible: true, items });
  assert.equal((schema?.mainEntity as unknown[]).length, 1);
});

test('VideoObject is omitted rather than inventing a publication date', () => {
  const base = {
    id: 'https://example.com/video#video',
    name: 'Demo',
    description: 'A real demo video.',
    thumbnailUrl: 'https://example.com/thumb.jpg',
    contentUrl: 'https://example.com/video.mp4',
  };
  assert.equal(buildVideoObjectSchema(base), null);
  assert.equal(buildVideoObjectSchema({ ...base, uploadDate: '2026-09-09' })?.['@type'], 'VideoObject');
});

test('Product only emits reviews supplied with valid real values', () => {
  const schema = buildProductSchema({
    id: 'https://example.com/product#product',
    name: 'Product',
    description: 'Description',
    images: ['https://example.com/product.jpg'],
    brand: 'Example',
    reviews: [
      { author: '', rating: 5 },
      { author: 'Real customer', rating: 4, body: 'Useful.' },
    ],
  });
  assert.equal((schema.review as unknown[]).length, 1);
});

test('Breadcrumbs require a meaningful hierarchy and JSON-LD is escaped', () => {
  assert.equal(buildBreadcrumbSchema([{ name: 'Home', url: 'https://example.com' }]), null);
  const escaped = safeJsonLd({ value: '</script><script>alert(1)</script>' });
  assert.ok(!escaped.includes('</script>'));
});
