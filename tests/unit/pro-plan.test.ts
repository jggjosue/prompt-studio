import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { PLAN_PRICES, getPlanPrice, planAtLeast, type PlanId } from '../../src/lib/subscription-plans.ts';

const source = (file: string) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');

test('la jerarquía de planes ordena de menor a mayor', () => {
  const orden: PlanId[] = ['free', 'premium', 'pro', 'startup'];
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
  // Es el error clásico al añadir un tramo: comparar con === y dejar fuera al
  // plan nuevo de todas las puertas que ya existían.
  assert.equal(planAtLeast('pro', 'premium'), true, 'Pro debe dar acceso a lo de Premium');
  assert.equal(planAtLeast('startup', 'pro'), true, 'Startup debe dar acceso a lo de Pro');
  assert.equal(planAtLeast('premium', 'pro'), false, 'Premium no alcanza a Pro');
  assert.equal(planAtLeast('free', 'premium'), false);
});

test('el tramo Pro está entre Premium y Startup en precio', () => {
  assert.ok(PLAN_PRICES.premium.monthly < PLAN_PRICES.pro.monthly, 'Pro debe costar más que Premium');
  assert.ok(PLAN_PRICES.pro.monthly < PLAN_PRICES.startup.monthly, 'Pro debe costar menos que Startup');
  assert.equal(getPlanPrice('pro', 'monthly'), 39);
  assert.equal(getPlanPrice('pro', 'annual'), 390);
  assert.equal(getPlanPrice('free', 'annual'), 0);
});

test('el anual siempre sale mejor que doce mensualidades', () => {
  for (const plan of ['premium', 'pro', 'startup'] as const) {
    const anual = getPlanPrice(plan, 'annual');
    const mensual = getPlanPrice(plan, 'monthly') * 12;
    assert.ok(anual < mensual, `el anual de ${plan} no ahorra nada`);
  }
});

test('las puertas usan la jerarquía, no comparaciones sueltas', async () => {
  const status = await source('src/lib/server-subscription-status.ts');
  // `plan === 'premium' || plan === 'startup'` dejaba fuera a Pro en silencio.
  assert.ok(
    status.includes("planAtLeast(status.plan, 'premium')"),
    'hasDownloadPlan debe comparar por jerarquía'
  );
  assert.ok(!/status\.plan === 'premium' \|\| status\.plan === 'startup'/.test(status), 'no debe quedar la comparación antigua');
  assert.ok(status.includes('export function hasPublishingPlan('), 'hace falta la puerta del tramo Pro');
});

test('la puerta del tramo Pro arranca desactivada', async () => {
  const status = await source('src/lib/server-subscription-status.ts');
  // Publicar en dominio propio y los brand kits están hoy abiertos a todos.
  // Activar la puerta al desplegar les quitaría el acceso sin avisar.
  assert.ok(status.includes("process.env.PRO_PLAN_ENFORCED === '1'"), 'la puerta debe ser opt-in explícito');
  assert.ok(
    status.includes('if (!PRO_PLAN_ENFORCED) return true;'),
    'sin la bandera, hasPublishingPlan no puede negar acceso a nadie'
  );
});

test('el tramo no se ofrece si no hay precio en Stripe', async () => {
  const checkout = await source('src/lib/stripe-checkout.ts');
  // Los otros planes usan `!` y confían en la variable; aquí no se puede,
  // porque el precio hay que crearlo a mano en el panel de Stripe.
  assert.ok(checkout.includes('export function isProPlanAvailable('), 'hace falta saber si el tramo es comprable');
  assert.ok(checkout.includes('if (!base) return \'\';'), 'sin enlace no se puede devolver una URL rota');
  const prices = await source('src/app/[locale]/prices/prices-client.tsx');
  assert.ok(prices.includes('proAvailable &&'), 'la tarjeta debe ocultarse sin enlaces de pago');
});

test('las puertas de publicación y brand kits están puestas', async () => {
  for (const route of ['src/app/api/publications/route.ts', 'src/app/api/brand-kits/route.ts']) {
    const code = await source(route);
    assert.ok(code.includes('hasPublishingPlan('), `${route} debe comprobar el plan`);
    assert.ok(code.includes('status:402'), `${route} debe responder 402 sin plan`);
  }
});

test('el plan nuevo está en todos los sitios que lo necesitan', async () => {
  // Ocho ficheros cableaban el tipo de plan. Si uno se olvida, el usuario paga
  // y el sistema lo trata como gratuito.
  for (const [file, needle] of [
    ['src/lib/stripe.ts', "'premium' | 'pro' | 'startup'"],
    ['src/lib/clerk-billing.ts', "pro: 'pro'"],
    ['src/lib/clerk-billing.ts', 'proAccess'],
    ['src/app/api/webhooks/stripe/route.ts', "'premium' | 'pro' | 'startup'"],
    ['src/lib/server-subscription-status.ts', 'DEV_PRO'],
  ] as const) {
    const code = await source(file);
    assert.ok(code.includes(needle), `${file} debe contener ${needle}`);
  }
});

test('las traducciones del tramo existen en los dos idiomas', async () => {
  for (const locale of ['es', 'en']) {
    const messages = JSON.parse(await source(`messages/${locale}.json`)) as { prices?: Record<string, string> };
    for (const key of ['proName', 'proDesc', 'proSubscribe', 'proFeaturePublish', 'proFeatureBrandKits']) {
      assert.ok(messages.prices?.[key], `falta prices.${key} en ${locale}`);
    }
  }
});
