import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const source = (file: string) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');

test('component checkout starts only after the server creates a Stripe session', async () => {
  const code = await source('src/components/component-checkout-dialog.tsx');
  assert.ok(code.includes("trackAnalyticsEvent('begin_checkout'"));
  assert.ok(code.includes("action_source: 'stripe_embedded_checkout_created'"));
  assert.ok(code.indexOf('if (!response.ok)') < code.indexOf("trackAnalyticsEvent('begin_checkout'"));
});

test('crowdfunding checkout is recorded only after a checkout URL is returned', async () => {
  const code = await source('src/components/CrowdfundingCheckout.tsx');
  assert.ok(code.includes("trackAnalyticsEvent('begin_checkout'"));
  assert.ok(code.indexOf("typeof result?.url !== 'string'") < code.indexOf("trackAnalyticsEvent('begin_checkout'"));
  assert.ok(code.indexOf("trackAnalyticsEvent('begin_checkout'") < code.indexOf('window.location.assign(result.url)'));
});

test('purchase signal is sourced from the signed Stripe webhook', async () => {
  const route = await source('src/app/api/webhooks/stripe/route.ts');
  const helper = await source('src/lib/payment-analytics.ts');
  assert.ok(route.includes('stripe.webhooks.constructEvent'));
  assert.ok(route.includes('recordConfirmedPurchase({'));
  assert.ok(helper.includes("name: 'purchase'"));
  assert.ok(helper.includes("source: 'stripe_signed_webhook'"));
  assert.ok(!helper.includes('email'));
});
