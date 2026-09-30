import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import {
  BLOCK_SPECS,
  PALETTE_BY_TYPE,
  canAddBlock,
  defaultComposition,
  describeComposition,
  duplicateBlock,
  insertBlockAt,
  moveBlock,
  removeBlock,
  sequentialIds,
  toggleBlockHidden,
  updateBlockText,
  type BuilderComponentType,
} from '../../src/lib/builder-blocks.ts';

const source = (file: string) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');

const TYPES: BuilderComponentType[] = ['login', 'header', 'text', 'form', 'button', 'card', 'navigation', 'sidebar'];

/* ---------------------------------------------------------------- acceso --- */

test('el constructor valida sesión y pago Premium en el servidor', async () => {
  const page = await source('src/app/[locale]/component-builder/page.tsx');

  assert.match(page, /await auth\(\)/);
  assert.match(page, /getServerSubscriptionStatus\(\)/);
  assert.match(page, /hasComponentBuilderPlan\(status\)/);
  assert.match(page, /ComponentBuilderPremiumGate/);
  assert.match(page, /return <ComponentBuilderClient\s*\/>/);
});

test('el generador de páginas muestra la puerta a quien no tiene plan', async () => {
  const page = await source('src/app/[locale]/page-composer/page.tsx');
  assert.match(page, /await auth\(\)/);
  assert.match(page, /getServerSubscriptionStatus\(\)/);
  assert.match(page, /hasComponentBuilderPlan\(status\)/);
  assert.match(page, /PageComposerPremiumGate/);
});

test('el generador de páginas lleva al Website Builder, no al compositor antiguo', async () => {
  const page = await source('src/app/[locale]/page-composer/page.tsx');
  // La puerta Premium se aplica antes de redirigir: el editor vive en una
  // subruta y este es el único punto que la protege.
  const gate = page.indexOf('PageComposerPremiumGate');
  const redirect = page.indexOf('redirect(');
  assert.ok(gate !== -1 && redirect !== -1, 'debe validar el plan y redirigir');
  assert.ok(gate < redirect, 'la puerta va antes de la redirección');
  assert.match(page, /redirect\(`\/\$\{locale\}\/page-composer\/website\/editor`\)/);

  // El compositor de bloques ya no existe: el generador es el Website Builder.
  assert.doesNotMatch(page, /PageComposerClient/);
});

test('el menú ofrece Constructor visual y Generador de páginas solo al super administrador', async () => {
  const header = await source('src/components/layout/header-client.tsx');

  // Las herramientas de creación solo las ve el super admin (PROMPT_STUDIO_PREMIUM_JO);
  // el resto de usuarios no las ve en el menú.
  assert.match(header, /useSuperAdmin\(\)/, 'el menú consulta si el usuario es super admin');
  assert.match(
    header,
    /\.\.\.\(isSuperAdmin \? paidCreatorItems\(\) : \[\]\)/,
    'las herramientas de creación solo se insertan para el super admin'
  );

  const items = header.match(/const paidCreatorItems = \(\): DropdownItem\[\] => \[[\s\S]*?\];/);
  assert.ok(items, 'debe existir la lista de herramientas de creación');
  assert.match(items[0], /href: '\/component-builder'/, 'Constructor visual');
  assert.match(items[0], /href: '\/page-composer'/, 'Generador de páginas');

  // Y no se sirven como «Próximamente».
  assert.doesNotMatch(
    items[0],
    /disabled|disabledBadge/,
    'habilitadas: nada de badge de «Próximamente»'
  );
});

test('el gate del menú cubre los planes creator, pro y studio', async () => {
  const hook = await source('src/hooks/use-membership-access.ts');
  assert.match(
    hook,
    /const hasPaidPlan = plan === 'creator' \|\| plan === 'pro' \|\| plan === 'studio'/,
    'premium/Creator y superiores deben ver el menú'
  );
});

test('el constructor sigue fuera del índice editorial', async () => {
  const page = await source('src/app/[locale]/component-builder/page.tsx');
  assert.match(page, /robots:\s*\{\s*index:\s*false/, 'no debe indexarse una versión por plan');
});

test('la API del builder no se fía de la página y exige plan Premium', async () => {
  // La puerta vive en la página, pero la API repite el control: el editor es
  // una ruta aparte y no puede heredarse de la redirección.
  const route = await source('src/app/api/page-composer/projects/[id]/route.ts');
  assert.match(route, /await auth\(\)/);
  assert.match(route, /getServerSubscriptionStatus\(\)/);
  assert.match(route, /hasComponentBuilderPlan\(status\)/);
});

/* --------------------------------------------------------------- bloques --- */

test('cada tipo arranca con una composición no vacía y permitida por su paleta', () => {
  for (const type of TYPES) {
    const blocks = defaultComposition(type, 'es', sequentialIds(type));
    assert.ok(blocks.length > 0, `${type} debe tener composición inicial`);
    for (const block of blocks) {
      assert.ok(
        PALETTE_BY_TYPE[type].includes(block.kind),
        `${type}: el bloque inicial "${block.kind}" no está en su paleta`
      );
    }
    const ids = new Set(blocks.map(b => b.id));
    assert.equal(ids.size, blocks.length, `${type}: los ids deben ser únicos`);
  }
});

test('el constructor incluye bloques de producto, confianza y conversión', () => {
  for (const kind of ['feature', 'stat', 'logoCloud', 'testimonial', 'faq', 'progress', 'footerLinks'] as const) {
    assert.ok(BLOCK_SPECS[kind], `${kind} debe estar disponible`);
  }
  assert.ok(PALETTE_BY_TYPE.card.includes('feature'));
  assert.ok(PALETTE_BY_TYPE.card.includes('testimonial'));
  assert.ok(PALETTE_BY_TYPE.text.includes('faq'));
  assert.ok(PALETTE_BY_TYPE.form.includes('progress'));
});

test('la composición inicial respeta el máximo de cada bloque', () => {
  for (const type of TYPES) {
    const blocks = defaultComposition(type);
    const cuenta = new Map<string, number>();
    for (const b of blocks) cuenta.set(b.kind, (cuenta.get(b.kind) ?? 0) + 1);
    for (const [kind, n] of cuenta) {
      assert.ok(
        n <= BLOCK_SPECS[kind as keyof typeof BLOCK_SPECS].max,
        `${type}: ${kind} aparece ${n} veces y el máximo es ${BLOCK_SPECS[kind as keyof typeof BLOCK_SPECS].max}`
      );
    }
  }
});

test('mover un bloque conserva todos los demás', () => {
  const blocks = defaultComposition('card', 'es', sequentialIds('card'));
  const movido = moveBlock(blocks, 0, 3);
  assert.equal(movido.length, blocks.length);
  assert.equal(movido[3].id, blocks[0].id, 'el bloque debe acabar en el destino');
  assert.deepEqual(
    [...movido].map(b => b.id).sort(),
    [...blocks].map(b => b.id).sort(),
    'no se pierde ni se duplica ningún bloque'
  );
});

test('un drop con índices imposibles no rompe la lista', () => {
  // El evento `drop` puede llegar con un índice viejo si la lista cambió
  // durante el arrastre. Debe devolver la lista, no lanzar.
  const blocks = defaultComposition('form');
  assert.deepEqual(moveBlock(blocks, 99, 0), blocks, 'origen fuera de rango');
  assert.deepEqual(moveBlock(blocks, -1, 2), blocks, 'origen negativo');
  assert.equal(moveBlock(blocks, 1, 99).length, blocks.length, 'destino fuera de rango se recorta');
  assert.deepEqual(moveBlock(blocks, 2, 2), blocks, 'mismo sitio: sin cambios');
});

test('insertar respeta el máximo y la posición', () => {
  let blocks = defaultComposition('text', 'es', sequentialIds('text'));
  const antes = blocks.length;
  blocks = insertBlockAt(blocks, 'body', 1, 'es', sequentialIds('nuevo'));
  assert.equal(blocks.length, antes + 1);
  assert.equal(blocks[1].kind, 'body');

  // `rating` tiene máximo 1: el segundo intento no debe añadir nada.
  let una = insertBlockAt(defaultComposition('card'), 'rating', 0);
  const tope = una.length;
  una = insertBlockAt(una, 'rating', 0);
  assert.equal(una.length, tope, 'no debe superar el máximo del bloque');
  assert.equal(canAddBlock(una, 'rating'), false);
});

test('duplicar, ocultar, editar y borrar se comportan como se espera', () => {
  const blocks = defaultComposition('card', 'es', sequentialIds('card'));
  const titulo = blocks.find(b => b.kind === 'title')!;

  const duplicado = duplicateBlock(blocks, titulo.id, sequentialIds('copia'));
  assert.equal(duplicado.length, blocks.length + 1);
  assert.notEqual(duplicado[1].id, duplicado[2].id, 'la copia necesita id propio');

  const oculto = toggleBlockHidden(blocks, titulo.id);
  assert.equal(oculto.find(b => b.id === titulo.id)?.hidden, true);
  assert.equal(toggleBlockHidden(oculto, titulo.id).find(b => b.id === titulo.id)?.hidden, false);

  const editado = updateBlockText(blocks, titulo.id, 'Otro título');
  assert.equal(editado.find(b => b.id === titulo.id)?.text, 'Otro título');
  assert.equal(blocks.find(b => b.id === titulo.id)?.text, titulo.text, 'no debe mutar el original');

  assert.equal(removeBlock(blocks, titulo.id).length, blocks.length - 1);
  assert.deepEqual(removeBlock(blocks, 'no-existe'), blocks);
});

test('el prompt describe la composición real y omite los bloques ocultos', () => {
  const blocks = defaultComposition('card', 'es', sequentialIds('card'));
  const texto = describeComposition(blocks, 'es');
  assert.match(texto, /Estructura, de arriba abajo \(6 bloques\)/);
  assert.match(texto, /1\. Imagen/, 'debe respetar el orden');

  const titulo = blocks.find(b => b.kind === 'title')!;
  const conOculto = describeComposition(toggleBlockHidden(blocks, titulo.id), 'es');
  assert.ok(!conOculto.includes(titulo.text), 'un bloque oculto no debe aparecer en el prompt');
  assert.match(conOculto, /\(5 bloques\)/);

  assert.match(describeComposition([], 'es'), /Sin bloques visibles/);
  assert.match(describeComposition(blocks, 'en'), /Structure, top to bottom/);
});
