import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const source = (file: string) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');

test('el cliente de Resend queda restringido al servidor', async () => {
  const code = await source('src/lib/resend.ts');
  assert.ok(code.startsWith("import 'server-only';"));
  assert.ok(!code.includes('NEXT_PUBLIC_RESEND_'));
});

test('las sincronizaciones no devuelven correos ni errores internos', async () => {
  for (const route of ['src/app/api/sync-registered-users-to-resend/route.ts']) {
    const code = await source(route);
    assert.ok(!code.includes('errors.push('), `${route} no debe acumular detalles sensibles`);
    assert.ok(!code.includes('error.message }, { status: 500'), `${route} no debe devolver errores internos`);
    assert.ok(code.includes("'RESEND_SYNC_FAILED'"), `${route} debe usar un código estable y seguro`);
  }
});

test('los procesos de Resend no escriben direcciones en logs', async () => {
  for (const file of [
    'scripts/ts/sync-resend.ts',
    'src/app/api/sync-clerk/route.ts',
  ]) {
    const code = await source(file);
    assert.ok(!/console\.(?:log|error|warn)\([^\n]*(?:user\.email|\$\{email\})/.test(code), file);
  }
});

test('el script operativo valida la clave antes de crear el cliente', async () => {
  const code = await source('scripts/ts/sync-resend.ts');
  assert.ok(code.indexOf('if (!process.env.RESEND_API_KEY)') < code.indexOf('new Resend(process.env.RESEND_API_KEY)'));
});
