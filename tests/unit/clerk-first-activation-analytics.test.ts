import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const source = (file: string) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');

test('Clerk analytics distinguishes signup start, completed signup and login', async () => {
  const code = await source('src/components/clerk-auth-analytics.tsx');
  for (const event of ['signup_started', 'sign_up', 'login']) assert.ok(code.includes(`'${event}'`));
  assert.ok(code.includes('previous !== false || !isSignedIn'));
  assert.ok(!code.includes('email'));
});

test('first activation is server-authoritative and emitted only for the first action', async () => {
  const client = await source('src/lib/activation-analytics.ts');
  const route = await source('src/app/api/analytics/activation/route.ts');
  assert.ok(client.includes("fetch('/api/analytics/activation'"));
  assert.ok(client.includes('if (!data?.firstActivation) return false'));
  assert.ok(client.includes("trackAnalyticsEvent('first_activation'"));
  assert.ok(route.includes('$setOnInsert'));
  assert.ok(route.includes('result.upsertedCount > 0'));
  assert.ok(route.includes("if (!userId)"));
});

test('successful save participates in activation without sending PII', async () => {
  const saved = await source('src/components/saved-items-provider.tsx');
  assert.ok(saved.includes("recordFirstActivation('save_prompt')"));
  assert.ok(!saved.includes('email'));
});
