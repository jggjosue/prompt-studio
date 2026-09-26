import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const source = (file: string) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');

test('la captación separa acceso gratuito y consentimiento de marketing', async () => {
  const route = await source('src/app/api/new-users/route.ts');
  assert.ok(route.includes('marketingConsent === true'));
  assert.ok(route.includes("marketingStatus: 'pending'"));
  assert.ok(route.includes('confirmationRequired'));
});

test('solo las direcciones confirmadas llegan a sincronizaciones recurrentes', async () => {
  for (const route of [
    'src/app/api/sync-resend/route.ts',
    'src/app/api/sync-registered-users-to-resend/route.ts',
  ]) {
    const code = await source(route);
    assert.ok(code.includes("marketingStatus: 'confirmed'"), route);
  }
  for (const route of [
    'src/app/api/sync-clerk/route.ts',
    'src/app/api/webhooks/clerk/route.ts',
  ]) {
    const code = await source(route);
    assert.ok(!code.includes('upsertResendContact'), `${route} no debe suscribir por crear una cuenta`);
  }
});

test('el enlace es opaco, expira y se consume de forma atómica', async () => {
  const token = await source('src/lib/newsletter-confirmation.ts');
  const confirm = await source('src/app/api/newsletter/confirm/route.ts');
  assert.ok(token.includes('randomBytes(32)'));
  assert.ok(token.includes("createHmac('sha256'"));
  assert.ok(confirm.includes("marketingConfirmationExpiresAt: { $gt: new Date() }"));
  assert.ok(confirm.includes("$unset: { marketingConfirmationTokenHash: 1"));
});

test('signup y confirmación se miden por separado', async () => {
  const metrics = await source('src/app/api/newsletter/metrics/route.ts');
  assert.ok(metrics.includes('signupRequests'));
  assert.ok(metrics.includes('confirmations'));
  assert.ok(metrics.includes('confirmationConversionRate'));
  assert.ok(metrics.includes('requireCronOrAdmin'));
});
