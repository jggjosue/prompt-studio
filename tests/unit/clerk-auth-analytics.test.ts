import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const source = (file: string) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');

test('Clerk auth analytics separates signup started, completed signup and login without PII', async () => {
  const component = await source('src/components/clerk-auth-analytics.tsx');
  for (const event of ['signup_started', 'sign_up', 'login']) assert.ok(component.includes(`'${event}'`));
  assert.ok(component.includes("previous !== false"));
  assert.ok(!component.includes('email'));
  assert.ok(!component.includes('userId'));
});

test('activation is defined as first meaningful post-registration product action', async () => {
  const route = await source('src/app/api/analytics/activation/route.ts');
  const model = await source('src/models/UserActivation.ts');
  for (const type of ['save_prompt','use_prompt','generate_image','generate_video','generate_web']) assert.ok(route.includes(`'${type}'`));
  assert.ok(model.includes('userId: { type: String, required: true, unique: true'));
  assert.ok(route.includes('$setOnInsert'));
});
