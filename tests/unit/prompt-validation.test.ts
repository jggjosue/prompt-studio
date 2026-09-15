import assert from 'node:assert/strict';
import test from 'node:test';
import { validateCatalogPrompt } from '../../src/lib/prompt-validation.ts';

test('validates an image prompt with result evidence and estimates', () => {
  const report = validateCatalogPrompt({ id: 'img-1', title: 'Studio product', description: 'A detailed studio image with soft lighting, centered composition, realistic materials and a clean background for ecommerce.', imageUrl: '/images/result.webp', type: 'image', tags: ['studio', 'product'] });
  assert.equal(report.status, 'verified');
  assert.equal(report.resultUrl, '/images/result.webp');
  assert.ok(report.consistencyScore >= 80);
  assert.ok(report.compatibleModels.some(model => model.id === 'nano-banana-pro'));
  assert.equal(report.changes[0]?.impact, 'none');
});

test('flags incomplete prompts instead of presenting them as verified', () => {
  const report = validateCatalogPrompt({ id: 'v-1', title: 'Draft', description: 'Short draft', imageUrl: '', type: 'video', tags: [] });
  assert.equal(report.status, 'review-needed');
  assert.ok(report.consistencyScore < 80);
  assert.ok(report.compatibleModels.some(model => model.id === 'veo-3-1'));
});
