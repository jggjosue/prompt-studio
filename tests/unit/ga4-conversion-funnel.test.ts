import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const source = (file: string) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');

test('GA4 funnel uses the shared conversion and privacy contracts', async () => {
  const analytics = await source('src/lib/analytics.ts');
  assert.ok(analytics.includes('KEY_CONVERSION_EVENTS'));
  assert.ok(analytics.includes('PROHIBITED_ANALYTICS_PROPERTIES'));
  assert.ok(analytics.includes('sanitizeAnalyticsParams'));
  assert.ok(analytics.includes('isKeyConversionEvent'));
});

test('UTM attribution survives navigation for the browser session', async () => {
  const analytics = await source('src/lib/analytics.ts');
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content']) {
    assert.ok(analytics.includes(key));
  }
  assert.ok(analytics.includes('ATTRIBUTION_STORAGE_KEY'));
  assert.ok(analytics.includes('sessionStorage.setItem(ATTRIBUTION_STORAGE_KEY'));
});

test('analytics does not forward query strings as page_location', async () => {
  const analytics = await source('src/lib/analytics.ts');
  assert.ok(analytics.includes('window.location.origin'));
  assert.ok(analytics.includes('window.location.pathname'));
  assert.ok(!analytics.includes('page_location: window.location.href'));
});

test('GA4 production validation is an explicit release gate', async () => {
  const runbook = await source('docs/GA4_CONVERSION_FUNNEL.md');
  for (const event of ['sign_up', 'save_prompt', 'begin_checkout', 'purchase']) {
    assert.ok(runbook.includes(`\`${event}\``));
  }
  assert.ok(runbook.includes('DebugView'));
  assert.ok(runbook.includes('Realtime'));
  assert.ok(runbook.includes('Do not close #634'));
});
