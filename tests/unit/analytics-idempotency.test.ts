import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
const source = (file: string) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');

test('client analytics claims idempotency keys before provider dispatch', async () => {
 const code=await source('src/lib/analytics.ts');
 assert.ok(code.includes('inFlightEventKeys'));
 assert.ok(code.includes('inFlightEventKeys.has(key) || window.localStorage.getItem(key)'));
 assert.ok(code.includes('inFlightEventKeys.has(key) || window.sessionStorage.getItem(key)'));
 assert.ok(code.indexOf('inFlightEventKeys.add(key)') < code.indexOf("gtag?.('event'"));
});
test('identity linking uses its journey id as idempotency key', async()=>{const code=await source('src/lib/analytics-identity.ts'); assert.ok(code.includes('{ idempotencyKey: anonymousId }'));});
test('server receipts enforce unique keys and explicit lifecycle', async()=>{const code=await source('src/models/AnalyticsEventReceipt.ts'); assert.ok(code.includes('unique: true')); for(const state of ['processing','completed','failed']) assert.ok(code.includes(`'${state}'`)); assert.ok(code.includes('expires: 60 * 60 * 24 * 90'));});
test('purchase delivery deduplicates but failed delivery can retry', async()=>{const code=await source('src/lib/payment-analytics.ts'); assert.ok(code.includes('$setOnInsert')); assert.ok(code.includes('receipt.upsertedCount === 0')); assert.ok(code.includes("status: 'completed'")); assert.ok(code.includes('AnalyticsEventReceipt.deleteOne'));});
