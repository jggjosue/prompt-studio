import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const source = (file: string) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');

test('el apartado de sincronización queda restringido al superadministrador', async () => {
  const page = await source('src/app/[locale]/dashboard/email-sync/page.tsx');
  const layout = await source('src/app/[locale]/dashboard/layout.tsx');

  assert.ok(page.includes('isPremiumJoAdmin()'));
  assert.ok(page.includes('notFound()'));
  assert.ok(layout.includes('isSuperAdmin'));
  assert.ok(layout.includes("href: '/dashboard/email-sync'"));
  assert.ok(layout.includes('PROMPT_STUDIO_PREMIUM_JO'));
});

test('el botón usa POST contra la única API MongoDB a Resend', async () => {
  const client = await source('src/app/[locale]/dashboard/email-sync/email-sync-client.tsx');
  const route = await source('src/app/api/sync-registered-users-to-resend/route.ts');

  assert.ok(client.includes("fetch('/api/sync-registered-users-to-resend'"));
  assert.ok(client.includes("method: 'POST'"));
  assert.ok(route.includes('requireCronOrAdmin'));
  assert.ok(route.includes('export const POST = syncRegisteredUsersToResend'));
});
