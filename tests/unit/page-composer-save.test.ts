import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import {
  composeBlocksFromSeed,
  DEFAULT_ORDER,
  sanitizeBlocks,
  sanitizeSettings,
  type PageComposerKey,
} from '../../src/lib/page-composer.ts';

const source = (file: string) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');

const makeId = (() => {
  let n = 0;
  return () => `id-${++n}`;
})();

const options = (() => {
  const all: Record<PageComposerKey, { id: string; title: string; prompt: string }[]> = {
    header: [{ id: 'header-1', title: 'H1', prompt: 'p' }],
    sidebar: [{ id: 'sidebar-1', title: 'S1', prompt: 'p' }],
    hero: [{ id: 'hero-1', title: 'Hero', prompt: 'p' }],
    card: [{ id: 'card-1', title: 'C1', prompt: 'p' }],
    form: [{ id: 'form-1', title: 'F1', prompt: 'p' }],
    button: [{ id: 'button-1', title: 'B1', prompt: 'p' }],
    footer: [{ id: 'footer-1', title: 'Foot', prompt: 'p' }],
    logoCloud: [{ id: 'logo-1', title: 'Logo', prompt: 'p' }],
    stats: [{ id: 'stats-1', title: 'Stats', prompt: 'p' }],
    features: [{ id: 'features-1', title: 'Features', prompt: 'p' }],
    testimonial: [{ id: 'testimonial-1', title: 'T', prompt: 'p' }],
    pricing: [{ id: 'pricing-1', title: 'Pricing', prompt: 'p' }],
    faq: [{ id: 'faq-1', title: 'Faq', prompt: 'p' }],
    newsletter: [{ id: 'newsletter-1', title: 'News', prompt: 'p' }],
  };
  return all;
})();

/* --------------------------------------------------------- composición --- */

test('sin kit, la composición inicial es la página tipo', () => {
  const blocks = composeBlocksFromSeed({}, options, makeId);
  assert.deepEqual(
    blocks.map(b => b.key),
    DEFAULT_ORDER
  );
  for (const block of blocks) {
    assert.equal(block.choiceId, options[block.key][0].id);
    assert.ok(block.instanceId, 'cada bloque tiene instanceId');
  }
});

test('un kit reemplaza los slots que trae en su semilla', () => {
  const seed = {
    kit: 'saas-dashboard-kit',
    header: 'header-1',
    card: 'card-1',
    form: 'form-1',
    button: 'button-1',
    sidebar: 'sidebar-1',
  };
  const blocks = composeBlocksFromSeed(seed, {
    ...options,
    header: [...options.header, { id: 'other', title: 'Other', prompt: 'p' }],
  }, makeId);
  const byKey = new Map(blocks.map(b => [b.key, b]));
  assert.equal(byKey.get('header')!.choiceId, 'header-1');
  assert.equal(byKey.get('card')!.choiceId, 'card-1');
  assert.equal(byKey.get('form')!.choiceId, 'form-1');
});

test('sidebar y button del kit entran en la página cuando la semilla los trae', () => {
  const blocks = composeBlocksFromSeed(
    { sidebar: 'sidebar-1', button: 'button-1' },
    options,
    makeId
  );
  const keys = blocks.map(b => b.key);
  assert.ok(keys.includes('sidebar'), 'sidebar debe aparecer');
  assert.ok(keys.includes('button'), 'button debe aparecer');
  assert.ok(keys.indexOf('sidebar') > keys.indexOf('header'), 'sidebar tras header');
  assert.ok(keys.indexOf('button') > keys.indexOf('card'), 'button tras card');
});

/* ------------------------------------------------------------ sanitizado --- */

test('sanitizeBlocks limpia y recorta contenido válido', () => {
  const result = sanitizeBlocks([
    {
      instanceId: 'a',
      key: 'header',
      choiceId: 'header-1',
      title: 'Navegación',
      prompt: 'prompt',
      content: { cta: 'Comenzar' },
    },
  ]);
  assert.ok('blocks' in result);
  if (!('blocks' in result)) return;
  assert.equal(result.blocks.length, 1);
  assert.deepEqual(result.blocks[0].content, { cta: 'Comenzar' });
});

test('sanitizeBlocks rechaza claves, tipos y límites inválidos', () => {
  assert.ok('error' in sanitizeBlocks('nope'));
  assert.ok('error' in sanitizeBlocks([{ key: 'hacker' }]));
  assert.ok('error' in sanitizeBlocks([{ key: 'header', instanceId: 42 }]));
  assert.ok('error' in sanitizeBlocks([{ key: 'header', content: ['x'] }]));
  const tooMany = Array.from({ length: 201 }, (_, i) => ({
    instanceId: `id${i}`,
    key: 'header' as const,
    choiceId: 'h',
    title: 't',
    prompt: 'p',
  }));
  assert.ok('error' in sanitizeBlocks(tooMany));
});

test('sanitizeSettings exige nombre y acota colores', () => {
  const ok = sanitizeSettings({ name: 'Mi web', brand: 'Nova', primary: '#ff00ff' });
  assert.ok('name' in ok);
  if (!('name' in ok)) return;
  assert.equal(ok.name, 'Mi web');
  assert.ok('error' in sanitizeSettings({ name: '' }));
  assert.ok('error' in sanitizeSettings({ name: 'x'.repeat(121) }));
});

/* --------------------------------------------------------- contratos UI --- */

test('la página pasa canEdit y la semilla del kit al cliente', async () => {
  const page = await source('src/app/[locale]/page-composer/page.tsx');
  assert.match(page, /return <PageComposerClient canEdit=/);
  assert.match(page, /seed=\{seed\}/);
  assert.match(page, /hasComponentBuilderPlan\(subscription\)/);
  assert.doesNotMatch(page, /PageComposerAccess/);
});

test('el cliente hidrata desde la semilla y ofrece guardar', async () => {
  const client = await source('src/app/[locale]/page-composer/page-composer-client.tsx');
  assert.match(client, /composeBlocksFromSeed\(seed/);
  assert.match(client, /api\/page-composer\/projects/);
  assert.match(client, /Guardar diseño/);
  assert.match(client, /canEdit/);
});

test('la API de diseños exige sesión y plan Premium', async () => {
  const route = await source('src/app/api/page-composer/projects/route.ts');
  assert.match(route, /await auth\(\)/);
  assert.match(route, /getServerSubscriptionStatus\(\)/);
  assert.match(route, /hasComponentBuilderPlan\(status\)/);
  assert.match(route, /PageComposerProject/);
  assert.match(route, /rateLimit/);
});

test('el modelo guarda la receta del compositor en una colección nueva', async () => {
  const model = await source('src/models/PageComposerProject.ts');
  assert.match(model, /page_composer_projects/);
  assert.match(model, /sourceKitId/);
  assert.match(model, /blocks/);
  assert.match(model, /userId: \{ type: String, required: true, index: true \}/);
});