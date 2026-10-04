import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = (path: string) => readFile(new URL(`../../${path}`, import.meta.url), 'utf8');

test('projects are the first authenticated destination on desktop and mobile', async () => {
  const [layout, mobile, signIn] = await Promise.all([
    source('src/app/[locale]/dashboard/layout.tsx'),
    source('src/components/dashboard/dashboard-mobile-nav.tsx'),
    source('src/app/[locale]/sign-in/[[...sign-in]]/page.tsx'),
  ]);
  assert.match(layout, /const navItems[\s\S]*?href: '\/dashboard\/projects'/);
  assert.match(mobile, /const links = \[[\s\S]*?href: '\/dashboard\/projects'/);
  assert.match(signIn, /NEXT_PUBLIC_CLERK_USER_PROFILE/);
  assert.match(signIn, /forceRedirectUrl=\{afterSignIn\}/);
  assert.match(signIn, /fallbackRedirectUrl=\{afterSignIn\}/);
});

test('sign-in never hardcodes a destination and reads it from the environment', async () => {
  const [header, signIn] = await Promise.all([
    source('src/components/layout/header-client.tsx'),
    source('src/app/[locale]/sign-in/[[...sign-in]]/page.tsx'),
  ]);
  // El destino viene de NEXT_PUBLIC_CLERK_USER_PROFILE. Un literal en un
  // SignInButton reintroduciría el bypass silencioso de la variable.
  // SignUpButton sí lleva una ruta fija a propósito (registro → /prices).
  for (const [name, code] of [['header', header], ['sign-in', signIn]] as const) {
    assert.match(code, /NEXT_PUBLIC_CLERK_USER_PROFILE/, `${name} debe leer la variable`);
    assert.doesNotMatch(
      code,
      /<SignInButton[^>]*forceRedirectUrl\s*=\s*"\//,
      `${name} no puede fijar una ruta literal en el SignInButton`
    );
    assert.doesNotMatch(
      code,
      /CLERK_USER_PROFILE[^\n]*\|\|\s*'\//,
      `${name} no debe tener una URL de respaldo; la variable es la única fuente`
    );
  }
  assert.match(header, /forceRedirectUrl=\{AFTER_SIGN_IN\}/);
});

test('the sign-in destination documented in .env.example resolves to a real route', async () => {
  // `/user` no existe en la app: el middleware lo reescribe a `/<locale>/user`
  // y responds 404 después de iniciar sesión.
  const example = await source('.env.example');
  const target = example
    .split('\n')
    .find(line => line.startsWith('NEXT_PUBLIC_CLERK_USER_PROFILE='))
    ?.split('=')[1]
    ?.trim();
  assert.ok(target, '.env.example debe documentar la variable');
  if (!target.startsWith('/')) return; // portal de Clerk alojado, ruta externa.

  const route = target.replace(/\/+$/, '');
  const page = new URL(
    `../../src/app/[locale]${route === '' ? '' : route}/page.tsx`,
    import.meta.url
  );
  await assert.doesNotReject(
    () => readFile(page, 'utf8'),
    `${target} no tiene page.tsx y devolverá 404 tras iniciar sesión`
  );
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
