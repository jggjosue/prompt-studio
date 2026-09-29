import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = (path: string) => readFile(new URL(`../../${path}`, import.meta.url), 'utf8');

test('projects are the first authenticated destination on desktop and mobile', async () => {
  const [layout, mobile, header, signIn] = await Promise.all([
    source('src/app/[locale]/dashboard/layout.tsx'),
    source('src/components/dashboard/dashboard-mobile-nav.tsx'),
    source('src/components/layout/header-client.tsx'),
    source('src/app/[locale]/sign-in/[[...sign-in]]/page.tsx'),
  ]);
  assert.match(layout, /const navItems[\s\S]*?href: '\/dashboard\/projects'/);
  assert.match(mobile, /const links = \[[\s\S]*?href: '\/dashboard\/projects'/);
  assert.doesNotMatch(header, /forceRedirectUrl="\/dashboard"/);
  assert.match(header, /forceRedirectUrl="\/dashboard\/projects"/);
  assert.match(signIn, /forceRedirectUrl="\/dashboard\/projects"/);
});

test('the project workspace selects a valid deep link or the first active project', async () => {
  const [page, client] = await Promise.all([
    source('src/app/[locale]/dashboard/projects/page.tsx'),
    source('src/app/[locale]/dashboard/projects/projects-client.tsx'),
  ]);
  assert.match(page, /initialProjectId=\{project\}/);
  assert.match(client, /item\.id===initialProjectId/);
  assert.match(client, /item\.status==='active'/);
  assert.match(client, /void open\(selected\.id\)/);
});

test('the project workspace has loading, empty, and recoverable error states', async () => {
  const [client, loading, error] = await Promise.all([
    source('src/app/[locale]/dashboard/projects/projects-client.tsx'),
    source('src/app/[locale]/dashboard/projects/loading.tsx'),
    source('src/app/[locale]/dashboard/projects/error.tsx'),
  ]);
  assert.match(client, /Crea o selecciona un proyecto/);
  assert.match(loading, /Cargando proyectos/);
  assert.match(error, /No pudimos cargar tus proyectos/);
  assert.match(error, /onClick=\{reset\}/);
});
