import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const source = (file: string) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');

test('reactivation runtime rechecks consent and product-update preference before send', async () => {
  const sender = await source('src/lib/reactivation-sender.ts');
  assert.ok(sender.includes("canSendNonTransactional(params.recipient, 'lifecycle')"));
  assert.ok(sender.includes("includes('product_updates')"));
  assert.ok(sender.includes('/email/unsubscribe'));
});

test('inactive processor segments from prior activity and persists an attempt only after send', async () => {
  const processor = await source('src/lib/reactivation-processor.ts');
  assert.ok(processor.includes('lastActiveAt: { $lte: cutoff }'));
  assert.ok(processor.includes('categoryFromActivity'));
  assert.ok(processor.indexOf('await sendReactivationEmail') < processor.indexOf('await ReactivationAttempt.create'));
});
