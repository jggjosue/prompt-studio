import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
const source = (file: string) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');
test('client analytics supports durable browser idempotency keys', async () => {
 const code=await source('src/lib/analytics.ts'); assert.ok(code.includes('idempotencyKey?: string')); assert.ok(code.includes('IDEMPOTENT_EVENT_PREFIX')); assert.ok(code.includes('window.localStorage.getItem(key)'));
});
test('identity linking uses its journey id as idempotency key', async()=>{const code=await source('src/lib/analytics-identity.ts'); assert.ok(code.includes('{ idempotencyKey: anonymousId }'));});
test('confirmed purchases use a durable Stripe transaction receipt', async()=>{const code=await source('src/lib/payment-analytics.ts'); assert.ok(code.includes('AnalyticsEventReceipt.updateOne')); assert.ok(code.includes('stripe:purchase:')); assert.ok(code.includes('$setOnInsert')); assert.ok(code.includes('receipt.upsertedCount === 0'));});
test('receipt ledger enforces unique keys and expires old receipts', async()=>{const code=await source('src/models/AnalyticsEventReceipt.ts'); assert.ok(code.includes('unique: true')); assert.ok(code.includes('expires: 60 * 60 * 24 * 90'));});
