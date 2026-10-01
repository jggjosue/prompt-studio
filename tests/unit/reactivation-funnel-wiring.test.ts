import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const source = (file: string) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');

test('reactivation cron is protected and executes inactive batch', async () => {
  const route = await source('src/app/api/cron/reactivation/route.ts');
  assert.ok(route.includes('requireCronOrAdmin'));
  assert.ok(route.includes('processInactiveReactivationBatch'));
});

test('return and activation update the latest eligible reactivation attempt', async () => {
  const funnel = await source('src/lib/reactivation-funnel.ts');
  for (const field of ['returnedAt','activatedAt','checkoutAt','purchasedAt']) assert.ok(funnel.includes(field));
  assert.ok(funnel.includes("sort: { sentAt: -1 }"));
  const activation = await source('src/app/api/analytics/activation/route.ts');
  assert.ok(activation.includes('recordUserProductActivity'));
  assert.ok(activation.includes("recordReactivationStage(userId, 'activation'"));
});

test('prior category is derived from successful product behavior', async () => {
  const activation = await source('src/app/api/analytics/activation/route.ts');
  for (const pair of ["generate_image: 'image'","generate_video: 'video'","generate_web: 'web'","save_prompt: 'prompt'"]) assert.ok(activation.includes(pair));
});
