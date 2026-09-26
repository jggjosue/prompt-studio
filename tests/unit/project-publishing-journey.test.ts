import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = (path: string) => readFile(new URL(`../../${path}`, import.meta.url), 'utf8');

test('campaign detail derives approval and publication from persisted project state', async () => {
  const route = await source('src/app/api/campaign-workflows/[id]/route.ts');
  assert.match(route, /select\('brand prompts exports decisions reviewStatus budget'\)/);
  assert.match(route, /reviewStatus: project\?\.reviewStatus \?\? 'draft'/);
  assert.match(route, /decision\.status === 'published'/);
});

test('campaign UI opens the exact project and renders the seven-stage journey', async () => {
  const client = await source('src/app/[locale]/dashboard/campaign-assistant/campaign-assistant-client.tsx');
  assert.match(client, /projects\?project=\$\{encodeURIComponent\(detail\.projectId\)\}/);
  assert.match(client, /xl:grid-cols-7/);
});
