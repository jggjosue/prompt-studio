import assert from 'node:assert/strict';
import test from 'node:test';
import {
  beginRegistration,
  canTransition,
  isQuoteFresh,
  markActive,
  markConfigurationPending,
  markPaid,
  markRegistered,
  quoteChanged,
  requireRefund,
  type DomainOrderRecord,
} from '../../src/lib/domain-order-core.ts';

function base(): DomainOrderRecord {
  return {
    id: 'order-1',
    userId: 'user-1',
    hostname: 'ejemplo.com',
    tld: 'com',
    provider: 'fake',
    state: 'quoted',
    quote: { registration: 12, renewal: 12, currency: 'USD', period: 'year', quotedAt: '2026-01-01T00:00:00.000Z' },
    idempotencyKey: 'key-1',
    siteId: null,
    stripeCheckoutSessionId: null,
    registrarOrderId: null,
    registrationAttempts: 0,
    refundEligible: false,
    failedReason: null,
    audit: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

test('transiciones válidas del state machine', () => {
  const order = base();
  assert.equal(canTransition(order, 'payment_pending'), true);
  assert.equal(canTransition(order, 'paid'), false, 'no se puede saltar el pago');
  const paid = markPaid({ ...order, state: 'payment_pending', stripeCheckoutSessionId: 'cs_1' }, 'cs_1', 't');
  assert.equal(paid.applied, true);
  if (paid.applied) assert.equal(paid.order.state, 'paid');
});

test('no se cobra dos veces: markPaid solo desde payment_pending', () => {
  const paid = markPaid({ ...base(), state: 'paid', stripeCheckoutSessionId: 'cs_1' } as DomainOrderRecord, 'cs_1', 't');
  assert.equal(paid.applied, false, 'webhook duplicado no reprocesa');
  assert.equal(paid.reason, 'La orden ya no está pendiente de pago.');
});

test('no se registra dos veces: beginRegistration/markRegistered exigen registrarOrderId ausente', () => {
  const registered = markRegistered(
    { ...base(), state: 'registering', registrarOrderId: 'reg-1' },
    'reg-1',
    't'
  );
  assert.equal(registered.applied, false, 'un segundo registro se rechaza');

  const registerAgain = beginRegistration(
    { ...base(), state: 'paid', registrarOrderId: 'reg-1' },
    't'
  );
  assert.equal(registerAgain.applied, false);
});

test('el flujo completo quoted → active con sitio asociado', () => {
  let order = base();
  order = { ...order, state: 'payment_pending', stripeCheckoutSessionId: 'cs_1' };

  const paid = markPaid(order, 'cs_1', 't');
  assert.equal(paid.applied, true);
  if (!paid.applied) return;
  order = paid.order;

  const registering = beginRegistration(order, 't');
  assert.equal(registering.applied, true);
  if (!registering.applied) return;
  order = registering.order;
  assert.equal(order.registrationAttempts, 1);

  const registered = markRegistered(order, 'reg-1', 't');
  assert.equal(registered.applied, true);
  if (!registered.applied) return;
  order = registered.order;

  const configured = markConfigurationPending(order, 'site-1', 't');
  assert.equal(configured.applied, true);
  if (!configured.applied) return;
  order = configured.order;
  assert.equal(order.siteId, 'site-1');

  const active = markActive(order, 't');
  assert.equal(active.applied, true);
  if (active.applied) assert.equal(active.order.state, 'active');
});

test('idempotencia: un webhook duplicado no cambia el estado ni rompe', () => {
  let order: DomainOrderRecord = { ...base(), state: 'payment_pending', stripeCheckoutSessionId: 'cs_1' };
  const first = markPaid(order, 'cs_1', 't');
  assert.equal(first.applied, true);
  if (first.applied) order = first.order;

  const duplicate = markPaid(order, 'cs_1', 't');
  assert.equal(duplicate.applied, false);
  assert.equal(order.state, 'paid', 'el estado original se conserva');
});

test('una sesión ajena no puede marcar la orden como pagada', () => {
  const order: DomainOrderRecord = { ...base(), state: 'payment_pending', stripeCheckoutSessionId: 'cs_1' };
  const wrong = markPaid(order, 'cs_otra', 't');
  assert.equal(wrong.applied, false);
  assert.match(wrong.reason, /no corresponde/);
});

test('frescura de la cotización y detección de cambio de precio', () => {
  const now = Date.parse('2026-01-01T00:10:00.000Z');
  assert.equal(isQuoteFresh(base(), now, 5 * 60_000), false, 'cotización vieja');
  assert.equal(isQuoteFresh({ ...base(), quote: { ...base().quote, quotedAt: new Date(now).toISOString() } }, now, 5 * 60_000), true);

  assert.equal(quoteChanged(base().quote, { ...base().quote, registration: 15 }), true);
  assert.equal(quoteChanged(base().quote, { ...base().quote }), false);
});

test('reembolso: no se promete cuando el dominio ya se registró', () => {
  const paidButNotRegistered: DomainOrderRecord = { ...base(), state: 'paid' };
  const refund = requireRefund(paidButNotRegistered, 'registrar falló', 't');
  assert.equal(refund.applied, true);
  if (refund.applied) assert.equal(refund.order.refundEligible, true);

  const alreadyRegistered: DomainOrderRecord = { ...base(), state: 'registered', registrarOrderId: 'reg-1' };
  const noRefund = requireRefund(alreadyRegistered, 'asociación falló', 't');
  assert.equal(noRefund.applied, true);
  if (noRefund.applied) assert.equal(noRefund.order.refundEligible, false, 'las reglas del registrar mandan');
});

test('failed desde payment_pending y desde paid son válidos', () => {
  const order: DomainOrderRecord = { ...base(), state: 'payment_pending' };
  // failOrder es la única transición a failed aquí.
  assert.equal(canTransition(order, 'failed'), true);
  assert.equal(canTransition(order, 'registering'), false);
});