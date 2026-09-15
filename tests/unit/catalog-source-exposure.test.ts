import assert from 'node:assert/strict';
import test from 'node:test';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * Impide que los ficheros fuente del catálogo vuelvan a ser descargables.
 *
 * Viven bajo `public/` y contienen los prompts de pago. El middleware los
 * bloquea con 404, pero un fichero nuevo añadido a `public/prompts/` quedaría
 * expuesto en silencio. Este test recorre el directorio real y comprueba que
 * cada fichero con producto de pago está cubierto por la regla.
 */

const root = new URL('../../', import.meta.url).pathname;

/** Copia de la regla de `src/proxy.ts`; el test de abajo verifica que no divergen. */
const PROTECTED = /^\/(?:prompts|webpages)\/[^/]+\.json(?:\.(?:br|gz))?$/;

function itemsOf(parsed: unknown): unknown[] {
  if (Array.isArray(parsed)) return parsed;
  if (parsed && typeof parsed === 'object') {
    const found = Object.values(parsed as Record<string, unknown>).find(Array.isArray);
    if (found) return found as unknown[];
  }
  return [];
}

/**
 * Detecta contenido de pago **entregable**, no la mera etiqueta Premium.
 *
 * El catálogo derivado sí incluye registros `Premium`, y debe: la UI necesita
 * saber qué está bloqueado. Lo que no puede incluir es el prompt completo.
 * `build-paged-catalogs.mjs` lo trunca a 240 caracteres con «…» para los
 * Premium y lo deja entero para los Free, que es lo correcto.
 *
 * Así que la fuga es: un registro Premium cuyo texto largo NO está truncado.
 */
function isPaidContent(item: unknown): boolean {
  if (!item || typeof item !== 'object') return false;
  const record = item as Record<string, unknown>;
  if (record.membership !== 'Premium') return false;

  return [record.prompt, record.description].some(field => {
    if (field == null) return false;
    const texts =
      typeof field === 'object'
        ? Object.values(field as Record<string, unknown>).map(String)
        : [String(field)];
    // Largo y sin marca de truncado = el contenido íntegro.
    return texts.some(text => text.length > 150 && !text.trimEnd().endsWith('…'));
  });
}

/** Todos los .json bajo `public/`, a cualquier profundidad. */
async function allJsonUnderPublic(dir = 'public'): Promise<string[]> {
  const found: string[] = [];
  let entries;
  try {
    entries = await readdir(path.join(root, dir), { withFileTypes: true });
  } catch {
    return found;
  }
  for (const entry of entries) {
    const relative = `${dir}/${entry.name}`;
    if (entry.isDirectory()) {
      found.push(...(await allJsonUnderPublic(relative)));
    } else if (entry.name.endsWith('.json')) {
      found.push(relative);
    }
  }
  return found;
}

test('no hay producto de pago en ningún fichero bajo public/', async () => {
  // Garantía principal desde que las fuentes se movieron a `src/data/`: el
  // producto ya no vive en un directorio servido estáticamente. El bloqueo del
  // middleware pasa a ser red de seguridad, no la única defensa.
  const candidates = await allJsonUnderPublic();
  assert.ok(candidates.length > 0, 'no se encontró ningún JSON en public/; ¿cambió la ruta?');

  const exposed: string[] = [];

  for (const relative of candidates) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(await readFile(path.join(root, relative), 'utf8'));
    } catch {
      continue;
    }
    const paid = itemsOf(parsed).filter(isPaidContent).length;
    if (paid) exposed.push(`${relative} (${paid} registros de pago)`);
  }

  assert.deepEqual(
    exposed,
    [],
    'Producto de pago en un directorio servido estáticamente:\n  ' + exposed.join('\n  ')
  );
});

test('las fuentes del catálogo viven fuera de public/', async () => {
  // Si alguien las devuelve a public/, el test de arriba lo detecta; este
  // comprueba que siguen donde deben y no se han perdido por el camino.
  const prompts = await readdir(path.join(root, 'src/data/prompts'));
  assert.ok(prompts.length >= 15, `esperaba >=15 catálogos en src/data/prompts, hay ${prompts.length}`);
  await readFile(path.join(root, 'src/data/web-pages.json'), 'utf8');
});

test('las variantes comprimidas también quedan bloqueadas', () => {
  // `precompress-static.mjs` genera .br y .gz. Sin cubrirlas, el bloqueo se
  // saltaría pidiendo `placeholder-images.json.br`.
  for (const suffix of ['', '.br', '.gz']) {
    assert.ok(
      PROTECTED.test(`/prompts/placeholder-images.json${suffix}`),
      `placeholder-images.json${suffix} debería estar bloqueado`
    );
    assert.ok(
      PROTECTED.test(`/webpages/web-pages.json${suffix}`),
      `web-pages.json${suffix} debería estar bloqueado`
    );
  }
});

test('el catálogo derivado y las rutas de página siguen accesibles', () => {
  // `public/catalog/` es el derivado público: build-paged-catalogs.mjs ya le
  // quita `description`, que es donde vive el prompt.
  for (const allowed of [
    '/catalog/images/en/page-001.abc.json',
    '/catalog/web-pages/es/manifest.json',
    '/prompts',              // ruta HTML, no fichero
    '/prompts/nano-banana-pro', // ficha por modelo
    '/webpages/mi-demo/index.html',
  ]) {
    assert.equal(PROTECTED.test(allowed), false, `${allowed} no debería bloquearse`);
  }
});

test('la regla del test no ha divergido de la del middleware', async () => {
  const proxy = await readFile(path.join(root, 'src/proxy.ts'), 'utf8');
  const match = proxy.match(/const PROTECTED_CATALOG_SOURCE = (\/.*\/);/);
  assert.ok(match, 'no se encontró PROTECTED_CATALOG_SOURCE en src/proxy.ts');
  assert.equal(
    match![1],
    PROTECTED.toString(),
    'la regla del middleware cambió; actualiza también la de este test'
  );
});
