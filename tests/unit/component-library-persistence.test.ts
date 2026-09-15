import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const source = (file: string) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');

/* ------------------------------------------------------- sesión obligatoria --- */

test('/my-components manda a registrarse cuando no hay sesión', async () => {
  const page = await source('src/app/[locale]/my-components/page.tsx');
  assert.match(page, /await auth\(\)/, 'debe comprobar la sesión en el servidor');
  assert.match(page, /if \(!userId\)/);
  assert.match(page, /redirect\(`\/sign-up\?redirect_url=/, 'debe enviar a crear cuenta, no a una pantalla vacía');
  assert.match(page, /encodeURIComponent\('\/my-components'\)/, 'debe conservar el destino');
  assert.match(page, /export const dynamic = 'force-dynamic'/);
  assert.match(page, /robots:\s*\{\s*index:\s*false/, 'página privada: no indexable');
});

test('la API de la biblioteca exige sesión en lectura y escritura', async () => {
  const route = await source('src/app/api/component-library/route.ts');
  const handlers = route.split(/export async function /).slice(1);
  assert.equal(handlers.length, 2, 'debe exponer GET y PUT');
  for (const handler of handlers) {
    const nombre = handler.slice(0, handler.indexOf('('));
    assert.match(handler, /const \{ userId \} = await auth\(\)/, `${nombre} debe leer la sesión`);
    assert.match(handler, /status: 401/, `${nombre} debe responder 401 sin sesión`);
  }
  assert.match(route, /rateLimit\(/, 'la escritura debe estar limitada');
  assert.match(route, /cacheHeaders\('private-no-store'\)/, 'contenido por usuario: no cacheable');
});

test('la escritura filtra por userId: nadie escribe en la cuenta de otro', async () => {
  const route = await source('src/app/api/component-library/route.ts');
  assert.match(route, /updateOne\(\s*\{ userId \}/, 'el upsert debe filtrar por userId');
  assert.match(route, /findOne\(\{ userId \}\)/, 'la lectura debe filtrar por userId');
});

test('el cuerpo se sanea antes de guardar', async () => {
  const route = await source('src/app/api/component-library/route.ts');
  // Un PUT manipulado no debe poder dejar un documento gigante en la cuenta.
  assert.match(route, /LIBRARY_LIMITS/, 'debe aplicar los límites del modelo');
  assert.match(route, /sanitizeState\(body\)/, 'debe sanear antes de escribir');
  for (const limite of ['favorites', 'recent', 'groups', 'componentsPerGroup', 'nameLength']) {
    const model = await source('src/models/ComponentLibrary.ts');
    assert.match(model, new RegExp(`${limite}:\\s*\\d+`), `falta el límite ${limite}`);
  }
});

/* ------------------------------------------------------------ base de datos --- */

test('la biblioteca se guarda en su propia colección', async () => {
  const model = await source('src/models/ComponentLibrary.ts');
  assert.match(model, /'component_libraries'/, 'debe fijar el nombre de la colección');
  assert.match(model, /userId:\s*\{[^}]*unique:\s*true/, 'una biblioteca por cuenta');
  for (const campo of ['favorites', 'recent', 'collections', 'projects']) {
    assert.match(model, new RegExp(`${campo}:\\s*\\{`), `falta el campo ${campo}`);
  }
});

test('el hook usa la base de datos como fuente de verdad', async () => {
  const hook = await source('src/hooks/use-component-library.ts');
  assert.match(hook, /const API = '\/api\/component-library'/);
  assert.match(hook, /method: 'PUT'/, 'debe persistir los cambios');
  assert.match(hook, /useAuth\(\)/, 'debe conocer la sesión');
  assert.match(hook, /requiresAuth/, 'debe exponer si falta cuenta');
  assert.match(hook, /requestAccount/, 'debe poder mandar a registrarse');
  assert.match(hook, /SIGN_UP_PATH/, 'debe reutilizar la ruta de registro del proyecto');
  // Sin sesión no se muestra la caché local: parecería guardado y no lo está.
  assert.match(hook, /if \(!isSignedIn\) \{\s*\n\s*\/\/[^\n]*\n\s*setBoth\(empty\)/, 'sin sesión el estado debe quedar vacío');
  assert.match(hook, /keepalive: true/, 'los cambios pendientes deben salir al cerrar la pestaña');
});

/* -------------------------------------------------------------- menú único --- */

test('los nueve kits de UI son una sola entrada de menú', async () => {
  const header = await source('src/components/layout/header-client.tsx');
  assert.match(header, /export const UI_KITS/, 'debe existir un único catálogo de kits');
  assert.match(header, /export const UI_KITS_TOTAL/, 'el total debe calcularse, no escribirse a mano');

  const kits = ['Animaciones', 'Login UI', 'Headers UI', 'Textos UI', 'Formularios UI', 'Botones UI', 'Cards UI', 'Menús UI', 'Sidebars UI'];
  for (const kit of kits) {
    const apariciones = header.split(`'${kit}'`).length - 1;
    assert.equal(apariciones, 1, `${kit} debe aparecer una sola vez (está ${apariciones})`);
  }

  // Y una sola entrada que reemplaza el contenido del mismo menú.
  assert.match(header, /label: 'Componentes UI'/);
  assert.match(header, /kits: UI_KITS/);
  assert.match(header, /webMenuPanel/, 'escritorio: estado del panel actual');
  assert.match(header, /setWebMenuPanel\('kits'\)/, 'abre el panel de kits dentro del mismo menú');
  assert.match(header, /setWebMenuPanel\('main'\)/, 'el botón Volver restaura las opciones principales');
  assert.doesNotMatch(header, /DropdownMenuSubTrigger/, 'no debe abrir un submenú lateral');
  assert.match(header, /item\.kits \?/, 'la entrada con kits se renderiza distinto');
});

test('los conteos del menú salen del catálogo real', async () => {
  const header = await source('src/components/layout/header-client.tsx');
  // El texto anterior decía «50 formularios» y hay 100 en el catálogo.
  assert.match(header, /label: 'Formularios UI', count: 100/, 'Formularios tiene 100 componentes');
  assert.match(header, /label: 'Animaciones', count: 180/, 'Animaciones tiene 180');
  assert.ok(!/50 formularios/.test(header), 'no debe quedar el conteo antiguo');
});
