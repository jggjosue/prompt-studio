import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const source = (file: string) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');

test('download requires auth, signed token, ownership, paid status and atomic limit', async () => {
  const value = await source('src/app/api/purchases/download/route.ts');
  for (const contract of ['verifyPurchaseDownloadToken', 'payload.userId !== userId', "status: 'paid'", "$lt: ['$downloadCount', '$maxDownloads']", '$inc: { downloadCount: 1 }']) assert.ok(value.includes(contract), `Falta contrato: ${contract}`);
});

test('checkout price is server-owned and webhook signature is verified', async () => {
  const checkout = await source('src/app/api/component-checkout/route.ts');
  const webhook = await source('src/app/api/webhooks/stripe/route.ts');
  assert.ok(checkout.includes('unit_amount: product.priceCents'));
  assert.ok(!checkout.includes('body.price'));
  assert.ok(webhook.includes('stripe.webhooks.constructEvent'));
  assert.ok(webhook.includes('isValidComponentPurchase'));
});

test('AI generation responses carry private-no-store cache headers to prevent stale caching', async () => {
  const routes = [
    'src/app/api/ai/jobs/route.ts',
    'src/app/api/ai/jobs/process/route.ts',
    'src/app/api/ai/jobs/[id]/route.ts',
    'src/app/api/debug/gemini-image/route.ts',
  ];
  for (const route of routes) {
    const src = await source(route);
    assert.ok(src.includes("cacheHeaders('private-no-store')"), `${route} debe marcar private-no-store`);
  }
});

test('AI generation is idempotent, credit-controlled and processed outside creation request', async () => {
  const create = await source('src/app/api/ai/jobs/route.ts');
  const process = await source('src/app/api/ai/jobs/process/route.ts');
  assert.ok(create.includes("request.headers.get('Idempotency-Key')"));
  assert.ok(create.includes('reserveCredits(job)'));
  assert.ok(!create.includes('runAIJob('));
  assert.ok(process.includes('runAIJob(job)'));
  assert.ok(process.includes('refundCredits(job)'));
});

test('Gemini smoke test is operations-only and never accepts secrets in the URL', async () => {
  const route = await source('src/app/api/debug/gemini-image/route.ts');
  assert.ok(route.includes('hasValidCronSecretHeader'));
  assert.ok(route.includes('isPremiumJoAdmin'));
  assert.ok(!route.includes("searchParams.get('secret')"));
  assert.ok(route.includes('validateGeminiSmokeImage'));
  assert.ok(route.includes('correlationId'));
});
