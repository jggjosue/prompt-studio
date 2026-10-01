import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const source = (file: string) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');

const REQUIRED = ['view_home','search','view_prompt','copy_prompt','use_prompt','generate_image','generate_video','generate_web','signup_started','sign_up','login','save_prompt','view_premium','view_pricing','select_plan','begin_checkout','purchase','newsletter_signup'];

test('GA4 funnel contract exposes every canonical event', async () => {
  const firebase = await source('src/lib/firebase.ts');
  for (const event of REQUIRED) assert.ok(firebase.includes(`| '${event}'`) || firebase.includes(`  | '${event}'`), `missing ${event}`);
});

test('analytics context contains auth state and UTMs without direct PII fields', async () => {
  const analytics = await source('src/lib/analytics.ts');
  for (const field of ['auth_state','utm_source','utm_medium','utm_campaign']) assert.ok(analytics.includes(field));
  assert.ok(!analytics.includes('user_email'));
  assert.ok(!analytics.includes('email_address'));
  assert.ok(analytics.includes('oncePerSessionKey'));
});
