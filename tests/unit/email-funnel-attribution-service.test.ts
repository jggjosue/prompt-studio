import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const source = (file: string) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');

test('email funnel recorder derives attribution from non-PII URL tokens', async () => {
  const service = await source('src/lib/email-funnel-attribution-service.ts');
  assert.ok(service.includes('attributionFromUrl(url)'));
  assert.ok(service.includes("eventType: 'email_purchase'"));
  assert.ok(!service.includes('recipient'));
  assert.ok(!service.includes('emailAddress'));
});

test('downstream funnel events use a deterministic unique key', async () => {
  const model = await source('src/models/EmailFunnelEvent.ts');
  const service = await source('src/lib/email-funnel-attribution-service.ts');
  assert.ok(model.includes('eventKey: { type: String, required: true, unique: true'));
  assert.ok(service.includes("createHash('sha256')"));
  assert.ok(service.includes('$setOnInsert'));
});
