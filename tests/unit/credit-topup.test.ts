import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import {
  CREDIT_PACKS,
  centsPerCredit,
  formatCreditPackPrice,
  getCreditPack,
  isCreditPackId,
  isValidCreditTopUp,
} from '../../src/lib/credit-packs.ts';

const source = (file: string) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');

test('el catálogo de packs es coherente', () => {
  assert.ok(CREDIT_PACKS.length >= 2, 'hace falta más de un pack para que exista elección');
  const ids = CREDIT_PACKS.map(pack => pack.id);
  assert.equal(new Set(ids).size, ids.length, 'los identificadores de pack deben ser únicos');
  for (const pack of CREDIT_PACKS) {
    assert.ok(pack.credits > 0, `${pack.id} debe abonar créditos`);
    assert.ok(pack.priceCents > 0, `${pack.id} debe tener precio`);
    assert.ok(pack.bonusCredits >= 0, `${pack.id} no puede tener bonus negativo`);
    assert.match(pack.currency, /^[a-z]{3}$/, `${pack.id} debe usar código ISO en minúsculas`);
  }
  assert.equal(CREDIT_PACKS.filter(pack => pack.featured).length, 1, 'solo un pack puede ir destacado');
});

test('todos los packs respetan el piso comercial de un centavo por crédito', () => {
  for (const pack of CREDIT_PACKS) {
    assert.ok(centsPerCredit(pack) >= 1, `${pack.id} vende créditos por debajo de $0.01`);
  }
});

test('getCreditPack rechaza entradas que no son packs', () => {
  assert.equal(getCreditPack(CREDIT_PACKS[0].id)?.id, CREDIT_PACKS[0].id);
  for (const value of [null, undefined, '', 'no-existe', 42, {}, []]) {
    assert.equal(getCreditPack(value), null, `${JSON.stringify(value)} no debería resolver a un pack`);
  }
  assert.equal(isCreditPackId('topup-20'), true);
  assert.equal(isCreditPackId('topup-999'), false);
});

test('isValidCreditTopUp exige que importe, moneda y usuario cuadren', () => {
  const pack = CREDIT_PACKS[0];
  const valid = {
    expectedPackId: pack.id,
    expectedUserId: 'user_1',
    expectedAmountCents: pack.priceCents,
    expectedCurrency: pack.currency,
    metadataPackId: pack.id,
    metadataUserId: 'user_1',
    buyerKey: 'user_1',
    amountTotal: pack.priceCents,
    currency: pack.currency,
  };
  assert.equal(isValidCreditTopUp(valid), true);

  // Pagar menos de lo que cuesta el pack no puede abonar créditos.
  assert.equal(isValidCreditTopUp({ ...valid, amountTotal: 1 }), false, 'un importe menor debe rechazarse');
  // Cambiar el pack en los metadatos tras pagar el barato tampoco.
  assert.equal(isValidCreditTopUp({ ...valid, metadataPackId: 'topup-150' }), false, 'el pack de los metadatos debe coincidir');
  // Abonar a otra cuenta distinta de la que pagó.
  assert.equal(isValidCreditTopUp({ ...valid, buyerKey: 'user_2' }), false, 'el comprador debe coincidir con el usuario');
  assert.equal(isValidCreditTopUp({ ...valid, metadataUserId: 'user_2' }), false, 'el usuario de los metadatos debe coincidir');
  // Pagar en una moneda más débil por el mismo número nominal.
  assert.equal(isValidCreditTopUp({ ...valid, currency: 'mxn' }), false, 'la moneda debe coincidir');
  assert.equal(isValidCreditTopUp({ ...valid, amountTotal: null }), false, 'sin importe confirmado no se abona');
  // La moneda se compara sin distinguir mayúsculas, como hace Stripe.
  assert.equal(isValidCreditTopUp({ ...valid, currency: pack.currency.toUpperCase() }), true);
});

test('el precio se formatea con la moneda del pack', () => {
  const formatted = formatCreditPackPrice(CREDIT_PACKS[0]);
  assert.match(formatted, /\d/, 'el precio formateado debe contener dígitos');
  assert.ok(formatted.length > 1);
});

test('el abono es idempotente frente a los reintentos de Stripe', async () => {
  const service = await source('src/lib/credit-topup.ts');
  // Stripe reintenta los webhooks: sin llave única, cada reintento regalaría
  // otro pack de créditos.
  assert.ok(
    service.includes("{ stripeCheckoutSessionId, status: 'pending' }"),
    'el abono debe reclamarse con un cambio de estado atómico sobre la sesión de Stripe'
  );
  assert.ok(
    service.includes('if (!claim.modifiedCount)'),
    'solo el proceso que gana la reclamación puede sumar saldo'
  );
  // El orden importa: reclamar y luego sumar. Al revés, un fallo intermedio
  // haría que el reintento sumara por segunda vez.
  assert.ok(
    service.indexOf('claim.modifiedCount') < service.indexOf('$inc: { balance:'),
    'la reclamación debe ocurrir antes de incrementar el saldo'
  );
});

test('la compra de créditos tiene llave única en base de datos', async () => {
  const model = await source('src/models/CreditPurchase.ts');
  assert.ok(
    /stripeCheckoutSessionId: \{ type: String, required: true, unique: true/.test(model),
    'sin índice único, dos webhooks simultáneos crearían dos compras'
  );
  assert.ok(
    /enum: \['pending', 'credited', 'refunded'\]/.test(model),
    'el estado intermedio `pending` es lo que hace detectable un abono a medias'
  );
});

test('la ruta de checkout no confía en el precio del cliente', async () => {
  const route = await source('src/app/api/credits/checkout/route.ts');
  // El cuerpo solo aporta el identificador; el importe sale del catálogo.
  assert.ok(route.includes('getCreditPack(body?.packId)'), 'el pack debe resolverse en servidor');
  assert.ok(route.includes('unit_amount: pack.priceCents'), 'el importe debe venir del catálogo, no del cliente');
  assert.ok(!/unit_amount: *[a-z]*body/.test(route), 'el cliente no puede fijar el importe');
  // Sin sesión no se abre checkout, y hay tope de peticiones.
  assert.ok(route.includes('await auth()') && route.includes('status: 401'), 'la ruta exige sesión');
  assert.ok(route.includes('rateLimit('), 'la ruta necesita límite de peticiones');
  assert.ok(route.includes("purchaseType: 'credit_topup'"), 'el webhook distingue la recarga por este metadato');
  assert.ok(route.includes("CROWDFUNDING_CREDITS_ACTIVE !== '1'"), 'las recargas se bloquean hasta activar el saldo tras crowdfunding');
  assert.ok(route.includes('validateCreditSaleEconomics'), 'el checkout valida la economía antes de vender el pack');
  assert.ok(!route.includes('allow_promotion_codes: true'), 'las recargas no aceptan promociones que rompan la economía');
});

test('el webhook trata la recarga aparte de la compra de páginas', async () => {
  const webhook = await source('src/app/api/webhooks/stripe/route.ts');
  const topUpAt = webhook.indexOf("purchaseType === 'credit_topup'");
  const pageAt = webhook.indexOf("if (session.mode === 'payment' && inferredProductId)");
  assert.ok(topUpAt > -1, 'el webhook debe reconocer la recarga');
  assert.ok(pageAt > -1, 'el bloque de compra de página debe seguir ahí');
  // Si la recarga cayera en el bloque de páginas, el pack acabaría registrado
  // como página comprada y generaría comisión de afiliado.
  assert.ok(topUpAt < pageAt, 'la recarga debe resolverse antes del bloque de compra de página');
  assert.ok(webhook.includes('isValidCreditTopUp('), 'el webhook revalida el importe antes de abonar');
  assert.ok(webhook.includes('throw new Error(`Invalid credit top-up metadata'), 'los metadatos manipulados deben fallar');
});
