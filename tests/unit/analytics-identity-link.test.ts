import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const source = (file: string) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');

test('anonymous identity is random first-party data and is rotated after signup link', async () => {
  const code = await source('src/lib/analytics-identity.ts');
  assert.ok(code.includes('crypto.randomUUID()'));
  assert.ok(code.includes("trackAnalyticsEvent('identity_linked'"));
  assert.ok(code.includes('localStorage.removeItem(ANONYMOUS_ID_KEY)'));
  assert.ok(code.includes('sessionStorage.getItem(IDENTITY_LINK_KEY)'));
  assert.ok(!code.includes('userId'));
  assert.ok(!code.includes('email'));
});

test('anonymous events receive the bridge id but authenticated events do not', async () => {
  const code = await source('src/lib/analytics.ts');
  assert.ok(code.includes("params.auth_state === 'anonymous'"));
  assert.ok(code.includes('getOrCreateAnonymousAnalyticsId()'));
});

test('identity link happens only after a completed Clerk signup transition', async () => {
  const code = await source('src/components/clerk-auth-analytics.tsx');
  const transition = code.indexOf('previous !== false || !isSignedIn');
  const link = code.indexOf('linkAnonymousJourneyAfterSignup()');
  assert.ok(transition >= 0);
  assert.ok(link > transition);
  assert.ok(code.includes("surface === 'sign_up'"));
});
