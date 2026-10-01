import assert from 'node:assert/strict';
import test from 'node:test';
import {
  AIPlanError,
  buildSitePlannerPrompt,
  parseSitePlanJson,
  planSite,
  repairSiteSchema,
} from '../../src/lib/editor/ai-site-planner.ts';
import { validatePageSchema } from '../../src/lib/editor/page-schema.ts';

const VALID_JSON = JSON.stringify({
  schemaVersion: 1,
  site: {
    name: 'Café Oaxaca',
    defaultLocale: 'es',
    seo: { title: 'Café Oaxaca', description: 'Café de especialidad en México.' },
    theme: { tokens: { 'color.primary': '#6f4e37', 'color.background': '#faf7f2' }, fontFamily: 'Inter, sans-serif' },
  },
  pages: [
    {
      id: 'page-home',
      name: 'Inicio',
      slug: '/',
      seo: { title: 'Café Oaxaca', description: 'Nuestro café.' },
      sections: [
        { id: 'nav', type: 'navbar', props: { brand: 'Café Oaxaca', brandHref: '/', links: [{ label: 'Menú', href: '#menu' }] }, styles: {}, children: [] },
        { id: 'hero', type: 'hero', props: { eyebrow: 'Café de especialidad', title: 'Bienvenido a Café Oaxaca', subtitle: 'Granos de altura, tueste local.', primaryLabel: 'Ver menú', primaryHref: '#menu', align: 'center' }, styles: {}, children: [] },
        { id: 'features', type: 'features', props: { heading: 'Por qué nos eligen', items: [{ title: 'Origen', description: 'Granos de altura.', icon: '✦' }], layout: 'cards' }, styles: {}, children: [] },
        { id: 'footer', type: 'footer', props: { brand: 'Café Oaxaca', copyright: '© Café Oaxaca.' }, styles: {}, children: [] },
      ],
    },
  ],
});

test('planSite: convierte una petición en un PageSchema válido', async () => {
  const result = await planSite('Crea un sitio para una cafetería en México.', {
    model: 'gemini-2.5-flash',
    callModel: async () => VALID_JSON,
  });
  const validation = validatePageSchema(result.schema);
  assert.equal(validation.ok, true);
  assert.equal(result.model, 'gemini-2.5-flash');
  assert.equal(result.schema.pages[0].sections.length, 4);
  assert.ok(result.schema.site.theme.tokens['color.primary']);
});

test('parseSitePlanJson: acepta JSON con vallas de markdown', () => {
  const result = parseSitePlanJson('```json\n' + VALID_JSON + '\n```');
  assert.equal(validatePageSchema(result.schema).ok, true);
});

test('planSite: rechaza petición vacía con error tipado', async () => {
  await assert.rejects(
    planSite('   ', { callModel: async () => VALID_JSON }),
    (error: unknown) => error instanceof AIPlanError && error.code === 'EMPTY_PROMPT'
  );
});

test('planSite: JSON malformado produce INVALID_JSON', async () => {
  await assert.rejects(
    planSite('haz un sitio', { callModel: async () => 'esto no es json' }),
    (error: unknown) => error instanceof AIPlanError && error.code === 'INVALID_JSON'
  );
});

test('planSite: versiones futuras se rechazan sin adivinar', async () => {
  const futuro = JSON.parse(VALID_JSON) as Record<string, unknown>;
  futuro.schemaVersion = 99;
  await assert.rejects(
    planSite('haz un sitio', { callModel: async () => JSON.stringify(futuro) }),
    (error: unknown) => error instanceof AIPlanError && error.code === 'INVALID_SCHEMA'
  );
});

test('repairSiteSchema: descarta componentes desconocidos', () => {
  const raw = JSON.parse(VALID_JSON) as Record<string, unknown>;
  (raw.pages as Record<string, unknown>[])[0] = {
    ...(raw.pages as Record<string, unknown>[])[0],
    sections: [{ id: 'x', type: 'video-player', props: {}, styles: {}, children: [] }],
  };
  const repaired = repairSiteSchema(raw);
  assert.ok(repaired);
  assert.equal(repaired.schema.pages[0].sections.length, 0);
  assert.ok(repaired.warnings.some(w => w.includes('video-player')));
});

test('repairSiteSchema: corrige anidamiento inválido', () => {
  const raw = JSON.parse(VALID_JSON) as Record<string, unknown>;
  // footer dentro de hero es inválido: debe descartarse ese hijo.
  (raw.pages as Record<string, unknown>[])[0] = {
    ...(raw.pages as Record<string, unknown>[])[0],
    sections: [
      {
        id: 'hero',
        type: 'hero',
        props: { title: 'X' },
        styles: {},
        children: [{ id: 'footer', type: 'footer', props: {}, styles: {}, children: [] }],
      },
    ],
  };
  const repaired = repairSiteSchema(raw);
  assert.ok(repaired);
  assert.equal(repaired.schema.pages[0].sections[0].children.length, 0);
});

test('repairSiteSchema: descarta URLs inseguras y props inválidas', () => {
  const raw = JSON.parse(VALID_JSON) as Record<string, unknown>;
  (raw.pages as Record<string, unknown>[])[0] = {
    ...(raw.pages as Record<string, unknown>[])[0],
    sections: [
      {
        id: 'hero',
        type: 'hero',
        props: { title: 'T', primaryHref: 'javascript:alert(1)', align: 'malo' },
        styles: {},
        children: [],
      },
    ],
  };
  const repaired = repairSiteSchema(raw);
  assert.ok(repaired);
  const hero = repaired.schema.pages[0].sections[0];
  assert.notEqual(hero.props.primaryHref, 'javascript:alert(1)');
  assert.equal(hero.props.align, undefined);
});

test('repairSiteSchema: sanea URLs inseguras dentro de listas estructuradas', () => {
  const raw = JSON.parse(VALID_JSON) as Record<string, unknown>;
  const page = (raw.pages as Record<string, unknown>[])[0];
  page.sections = [{
    id: 'nav',
    type: 'navbar',
    props: { brand: 'Café', links: [{ label: 'Peligro', href: 'javascript:alert(1)' }, { label: 'Menú', href: '#menu' }] },
    styles: {},
    children: [],
  }];
  const repaired = repairSiteSchema(raw);
  assert.ok(repaired);
  const links = repaired.schema.pages[0].sections[0].props.links as Array<Record<string, unknown>>;
  assert.equal(links.length, 1);
  assert.equal(links[0].href, '#menu');
});

test('repairSiteSchema: repara ids y slugs duplicados y ordena navbar/footer', () => {
  const raw = JSON.parse(VALID_JSON) as Record<string, unknown>;
  const first = (raw.pages as Record<string, unknown>[])[0];
  first.sections = [
    { id: 'same', type: 'footer', props: { brand: 'Café' }, styles: {}, children: [] },
    { id: 'same', type: 'hero', props: { title: 'Hola' }, styles: {}, children: [] },
    { id: 'same', type: 'navbar', props: { brand: 'Café' }, styles: {}, children: [] },
  ];
  raw.pages = [first, { ...structuredClone(first), id: first.id, name: 'Otra' }];
  const repaired = repairSiteSchema(raw);
  assert.ok(repaired);
  assert.equal(validatePageSchema(repaired.schema).ok, true);
  assert.equal(repaired.schema.pages[0].sections[0].type, 'navbar');
  assert.equal(repaired.schema.pages[0].sections.at(-1)?.type, 'footer');
  assert.notEqual(repaired.schema.pages[0].slug, repaired.schema.pages[1].slug);
});

test('repairSiteSchema: descarta estilos peligrosos', () => {
  const raw = JSON.parse(VALID_JSON) as Record<string, unknown>;
  (raw.pages as Record<string, unknown>[])[0] = {
    ...(raw.pages as Record<string, unknown>[])[0],
    sections: [
      {
        id: 'hero',
        type: 'hero',
        props: { title: 'T' },
        styles: { desktop: { background: 'red;}' } },
        children: [],
      },
    ],
  };
  const repaired = repairSiteSchema(raw);
  assert.ok(repaired);
  assert.equal('background' in (repaired.schema.pages[0].sections[0].styles.desktop ?? {}), false);
});

test('planSite: el proveedor que falla produce PROVIDER_ERROR', async () => {
  await assert.rejects(
    planSite('haz un sitio', {
      callModel: async () => {
        throw new Error('red caída');
      },
    }),
    (error: unknown) => error instanceof AIPlanError && error.code === 'PROVIDER_ERROR'
  );
});

test('buildSitePlannerPrompt: instruye a no devolver HTML', () => {
  const { system } = buildSitePlannerPrompt('sitio');
  assert.match(system, /NUNCA devuelvas HTML/i);
  assert.match(system, /JSON válido/i);
  assert.match(system, /javascript:/i);
});

test('planSite: el schema generado reutiliza componentes del catálogo', async () => {
  const result = await planSite('cafetería', { callModel: async () => VALID_JSON });
  const types = new Set(result.schema.pages[0].sections.map(section => section.type));
  for (const type of types) {
    assert.ok(
      ['navbar', 'hero', 'features', 'footer'].includes(type),
      `tipo fuera del catálogo: ${type}`
    );
  }
});

test('migración: un schema IA que ya era válido no se repara (sin warnings)', async () => {
  const reparsed = parseSitePlanJson(VALID_JSON);
  assert.deepEqual(reparsed.warnings, []);
});
