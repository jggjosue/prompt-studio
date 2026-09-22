import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { getPlanPrice, planAtLeast, getPlanCredits, type PlanId } from '../../src/lib/subscription-plans.ts';

const source = (file: string) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');

test('la jerarquía de planes ordena de menor a mayor', () => {
  const orden: PlanId[] = ['free', 'creator', 'pro', 'studio'];
  for (let i = 0; i < orden.length; i += 1) {
    for (let j = 0; j < orden.length; j += 1) {
      assert.equal(
        planAtLeast(orden[i], orden[j]),
        i >= j,
        `planAtLeast('${orden[i]}', '${orden[j]}') debería ser ${i >= j}`
      );
    }
  }
});

test('un plan superior cubre lo que exige uno inferior', () => {
  assert.equal(planAtLeast('pro', 'creator'), true, 'Pro debe dar acceso a lo de Creator');
  assert.equal(planAtLeast('studio', 'pro'), true, 'Studio debe dar acceso a lo de Pro');
  assert.equal(planAtLeast('creator', 'pro'), false, 'Creator no alcanza a Pro');
  assert.equal(planAtLeast('free', 'creator'), false);
});

test('los precios de los planes son correctos', () => {
  assert.equal(getPlanPrice('creator', 'monthly'), 9);
  assert.equal(getPlanPrice('creator', 'annual'), 90);
  assert.equal(getPlanPrice('pro', 'monthly'), 19);
  assert.equal(getPlanPrice('pro', 'annual'), 190);
  assert.equal(getPlanPrice('studio', 'monthly'), 39);
  assert.equal(getPlanPrice('studio', 'annual'), 390);
  assert.equal(getPlanPrice('free', 'annual'), 0);
});

test('los créditos de los planes son correctos', () => {
  assert.equal(getPlanCredits('free'), 1);
  assert.equal(getPlanCredits('creator'), 250);
  assert.equal(getPlanCredits('pro'), 1000);
  assert.equal(getPlanCredits('studio'), 3000);
});

test('el anual siempre sale mejor que doce mensualidades', () => {
  for (const plan of ['creator', 'pro', 'studio'] as const) {
    const anual = getPlanPrice(plan, 'annual');
    const mensual = getPlanPrice(plan, 'monthly') * 12;
    assert.ok(anual < mensual, `el anual de ${plan} no ahorra nada`);
  }
});

test('las puertas usan la jerarquía, no comparaciones sueltas', async () => {
  const status = await source('src/lib/server-subscription-status.ts');
  assert.ok(
    status.includes("planAtLeast(status.plan, 'creator')"),
    'hasDownloadPlan debe comparar por jerarquía'
  );
  assert.ok(!/status\.plan === 'creator' \|\| status\.plan === 'studio'/.test(status), 'no debe quedar la comparación antigua');
  assert.ok(status.includes('export function hasPublishingPlan('), 'hace falta la puerta del tramo Pro');
});

test('la puerta del tramo Pro arranca desactivada', async () => {
  const status = await source('src/lib/server-subscription-status.ts');
  assert.ok(status.includes("process.env.PRO_PLAN_ENFORCED === '1'"), 'la puerta debe ser opt-in explícito');
  assert.ok(
    status.includes('if (!PRO_PLAN_ENFORCED) return true;'),
    'sin la bandera, hasPublishingPlan no puede negar acceso a nadie'
  );
});

test('el tramo no se ofrece si no hay precio en Stripe', async () => {
  const checkout = await source('src/lib/stripe-checkout.ts');
  assert.ok(checkout.includes('export function isCreatorPlanAvailable('), 'hace falta saber si el tramo creator es comprable');
  assert.ok(checkout.includes('export function isProPlanAvailable('), 'hace falta saber si el tramo pro es comprable');
  assert.ok(checkout.includes('export function isStudioPlanAvailable('), 'hace falta saber si el tramo studio es comprable');
  assert.ok(checkout.includes("if (!base) return '';"), 'sin enlace no se puede devolver una URL rota');
  const prices = await source('src/app/[locale]/prices/prices-client.tsx');
  assert.ok(prices.includes('isProAvailable') || prices.includes('isCreatorAvailable') || prices.includes('isStudioAvailable'), 'las tarjetas deben verificar disponibilidad');
});

test('las puertas de publicación y brand kits están puestas', async () => {
  for (const route of ['src/app/api/publications/route.ts', 'src/app/api/brand-kits/route.ts']) {
    const code = await source(route);
    assert.ok(code.includes('hasPublishingPlan('), `${route} debe comprobar el plan`);
    assert.ok(code.includes('status:402'), `${route} debe responder 402 sin plan`);
  }
});

test('la migración de planes legacy está documentada', async () => {
  const plans = await source('src/lib/subscription-plans.ts');
  assert.ok(plans.includes('normalizeExistingPlan'), 'debe existir la función de migración');
  assert.ok(plans.includes("if (plan === 'premium') return 'creator'"), 'premium debe mapear a creator');
  assert.ok(plans.includes("if (plan === 'startup') return 'studio'"), 'startup debe mapear a studio');
});

test('el plan nuevo está en todos los sitios que lo necesitan', async () => {
  for (const [file, needle] of [
    ['src/lib/stripe.ts', "'creator' | 'pro' | 'studio'"],
    ['src/lib/clerk-billing.ts', "creator: 'creator'"],
    ['src/lib/clerk-billing.ts', 'creatorAccess'],
    ['src/app/api/webhooks/stripe/route.ts', "'creator' | 'pro' | 'studio'"],
    ['src/lib/server-subscription-status.ts', 'DEV_CREATOR'],
  ] as const) {
    const code = await source(file);
    assert.ok(code.includes(needle), `${file} debe contener ${needle}`);
  }
});

test('las traducciones de los nuevos planes existen en los dos idiomas', async () => {
  for (const locale of ['es', 'en']) {
    const messages = JSON.parse(await source(`messages/${locale}.json`)) as { prices?: Record<string, string> };
    for (const key of ['creatorName', 'proName', 'studioName', 'creatorSubscribe', 'proSubscribe', 'studioSubscribe']) {
      assert.ok(messages.prices?.[key], `falta prices.${key} en ${locale}`);
    }
  }
});

test('la migración de suscriptores existentes preserva el acceso', async () => {
  const status = await source('src/lib/server-subscription-status.ts');
  assert.ok(status.includes('normalizeExistingPlan'), 'getServerSubscriptionStatus debe normalizar planes legacy');
});
