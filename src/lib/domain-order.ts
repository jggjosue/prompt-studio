import 'server-only';

import { randomUUID } from 'node:crypto';
import connectToDatabase from '@/lib/mongoose';
import DomainOrder, { type IDomainOrder } from '@/models/DomainOrder';
import PageComposerDomain from '@/models/PageComposerDomain';
import { resolveDomainProvider } from '@/lib/registrars';
import { authoritativeCheck, freshPrice } from '@/lib/domain-search';
import { stripe } from '@/lib/stripe';
import { getSiteUrl } from '@/lib/site-url';
import { recordObservabilityEvent } from '@/lib/observability-server';
import { tldOf, type DomainProvider } from '@/lib/domain-provider';
import {
  appendAudit,
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
  type DomainQuote,
} from './domain-order-core';

function toRecord(document: IDomainOrder): DomainOrderRecord {
  return {
    id: String(document._id),
    userId: document.userId,
    hostname: document.hostname,
    tld: document.tld,
    provider: document.provider,
    state: document.state,
    quote: {
      registration: document.quote.registration,
      renewal: document.quote.renewal,
      currency: document.quote.currency,
      period: document.quote.period,
      quotedAt: document.quote.quotedAt.toISOString(),
    },
    idempotencyKey: document.idempotencyKey,
    siteId: document.siteId ? String(document.siteId) : null,
    stripeCheckoutSessionId: document.stripeCheckoutSessionId ?? null,
    registrarOrderId: document.registrarOrderId ?? null,
    registrationAttempts: document.registrationAttempts,
    refundEligible: document.refundEligible,
    failedReason: document.failedReason ?? null,
    audit: document.audit.map(entry => ({ at: entry.at.toISOString(), event: entry.event, detail: entry.detail ?? undefined })),
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
  };
}

async function save(record: DomainOrderRecord): Promise<IDomainOrder> {
  const document = await DomainOrder.findOneAndUpdate(
    { _id: record.id, userId: record.userId },
    {
      $set: {
        state: record.state,
        quote: { ...record.quote, quotedAt: new Date(record.quote.quotedAt) },
        siteId: record.siteId ?? null,
        stripeCheckoutSessionId: record.stripeCheckoutSessionId ?? null,
        registrarOrderId: record.registrarOrderId ?? null,
        registrationAttempts: record.registrationAttempts,
        refundEligible: record.refundEligible,
        failedReason: record.failedReason ?? null,
        audit: record.audit.map(entry => ({ at: new Date(entry.at), event: entry.event, detail: entry.detail ?? null })),
        updatedAt: new Date(),
      },
    },
    { new: true }
  );
  if (!document) throw new Error('ORDER_NOT_FOUND');
  return document;
}

export type QuoteDomainInput = { userId: string; hostname: string; provider?: DomainProvider };

/**
 * 1) Cotiza un dominio: comprobación fresca de disponibilidad + precio fresco.
 * Crea la orden en `quoted` con su `idempotencyKey` (única).
 */
export async function quoteDomain({ userId, hostname, provider = resolveDomainProvider() }: QuoteDomainInput): Promise<DomainOrderRecord> {
  await connectToDatabase();

  const check = await authoritativeCheck(hostname, provider);
  if (check.available !== 'available') {
    throw new Error(`"${hostname}" no está disponible.`);
  }
  const price = await freshPrice(hostname, provider);
  if (!price) throw new Error('El registrar no devolvió precio.');

  const quote: DomainQuote = { ...price, quotedAt: new Date().toISOString() };
  const idempotencyKey = randomUUID();

  const created = await DomainOrder.create({
    userId,
    hostname,
    tld: tldOf(hostname),
    provider: provider.id,
    state: 'quoted',
    quote: { ...quote, quotedAt: new Date() },
    idempotencyKey,
    refundEligible: false,
    audit: [{ at: new Date(), event: 'quoted', detail: `Disponible · $${price.registration}/año` }],
  });
  return toRecord(created);
}

export type RequestCheckoutInput = {
  userId: string;
  orderId: string;
  siteId?: string;
};

/**
 * 2) Confirma la compra: re-verifica frescura de disponibilidad y precio y crea
 * la sesión de Stripe con una idempotency key. Solo se puede desde `quoted`.
 */
export async function requestCheckout({ userId, orderId, siteId }: RequestCheckoutInput): Promise<{ checkoutUrl: string; record: DomainOrderRecord }> {
  await connectToDatabase();
  const document = await DomainOrder.findOne({ _id: orderId, userId });
  if (!document) throw new Error('ORDER_NOT_FOUND');

  const record = toRecord(document);
  if (record.state !== 'quoted') throw new Error(`La orden está en estado ${record.state}; no se puede iniciar el pago.`);

  const provider = resolveDomainProvider();

  // Nunca se confía en una cotización vieja: re-verificar disponibilidad y precio.
  const check = await authoritativeCheck(record.hostname, provider);
  if (check.available !== 'available') {
    const failed = appendAudit({ ...record, state: 'failed' }, new Date().toISOString(), 'failed', 'El dominio ya no está disponible.');
    await save(failed);
    throw new Error('El dominio ya no está disponible.');
  }
  const price = await freshPrice(record.hostname, provider);
  if (price && quoteChanged(record.quote, { ...price, quotedAt: record.quote.quotedAt })) {
    const requoted = appendAudit(
      { ...record, quote: { ...price, quotedAt: new Date().toISOString() } },
      new Date().toISOString(),
      'requoted',
      `Precio actualizado a $${price.registration}.`
    );
    await save(requoted);
    record.quote = requoted.quote;
  }

  const amount = Math.round(record.quote.registration * 100);
  const session = await stripe.checkout.sessions.create(
    {
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: record.quote.currency.toLowerCase(),
            unit_amount: amount,
            product_data: { name: `${record.hostname} (registro 1 año)` },
          },
          quantity: 1,
        },
      ],
      metadata: { type: 'domain_order', orderId: record.id },
      success_url: `${getSiteUrl().replace(/\/$/, '')}/page-composer/website/subscriptions?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getSiteUrl().replace(/\/$/, '')}/page-composer/website/subscriptions`,
    },
    { idempotencyKey: record.idempotencyKey }
  );

  const pending = appendAudit(
    {
      ...record,
      state: 'payment_pending',
      stripeCheckoutSessionId: session.id,
      siteId: siteId ?? record.siteId ?? null,
    },
    new Date().toISOString(),
    'payment_started',
    session.id
  );
  await save(pending);

  return { checkoutUrl: session.url ?? '', record: pending };
}

export type DomainOrder = DomainOrderRecord;

/** Procesa `checkout.session.completed` de forma idempotente (webhook duplicado seguro). */
export async function handleCheckoutCompleted(sessionId: string): Promise<{ applied: boolean; orderId?: string; reason?: string }> {
  await connectToDatabase();
  const document = await DomainOrder.findOne({ stripeCheckoutSessionId: sessionId });
  if (!document) return { applied: false, reason: 'No hay orden para esta sesión.' };

  let record = toRecord(document);
  const at = new Date().toISOString();
  const paid = markPaid(record, sessionId, at);
  if (!paid.applied) {
    // Webhook duplicado o sesión ajena.
    return { applied: false, reason: paid.reason, orderId: record.id };
  }
  record = paid.order;
  await save(record);

  // Registrar el dominio (idempotente: solo si no hay registrarOrderId).
  const provider = resolveDomainProvider();
  const registering = beginRegistration(record, at);
  if (!registering.applied) return { applied: false, reason: registering.reason, orderId: record.id };
  record = registering.order;
  await save(record);

  try {
    const result = await provider.register(record.hostname);
    const registered = markRegistered(record, result.orderId, new Date().toISOString());
    if (!registered.applied) return { applied: false, reason: registered.reason, orderId: record.id };
    record = registered.order;
    await save(record);
  } catch (error) {
    // El pago se cobró pero el registrar no pudo registrar: reembolso si procede.
    const refund = requireRefund(record, error instanceof Error ? error.message : 'El registrar rechazó el registro.', new Date().toISOString());
    if (refund.applied) {
      record = refund.order;
      await save(record);
      if (refund.order.refundEligible) {
        await refundPayment(record, error instanceof Error ? error.message : undefined).catch(() => undefined);
      }
    }
    await recordObservabilityEvent({
      category: 'commerce',
      name: 'page_composer_domain_registration_failed',
      route: '/api/webhooks/stripe',
      userId: record.userId,
      status: 'error',
      metadata: { orderId: record.id, hostname: record.hostname },
    });
    return { applied: false, reason: 'El registro falló; se gestiona el reembolso.', orderId: record.id };
  }

  // Asociar con el sitio si se indicó.
  if (record.siteId) {
    const associated = markConfigurationPending(record, record.siteId, new Date().toISOString());
    if (associated.applied) {
      record = associated.order;
      await save(record);
      await PageComposerDomain.create({
        siteId: record.siteId,
        hostname: record.hostname,
        provider: record.provider,
        providerHostnameId: record.registrarOrderId,
        status: 'pending',
        verification: { status: 'pending', lastCheckedAt: new Date() },
        ssl: { status: 'pending' },
        dns: { host: record.hostname, recordType: 'CNAME', target: 'custom-hostname.prompstudio.com' },
        isCanonical: false,
      });
    }
  } else {
    const pendingConfig = appendAudit(record, new Date().toISOString(), 'associated_later', 'Sin sitio asociado todavía.');
    record = pendingConfig;
    await save(record);
  }

  await recordObservabilityEvent({
    category: 'commerce',
    name: 'page_composer_domain_order',
    route: '/api/webhooks/stripe',
    userId: record.userId,
    status: 'success',
    metadata: { orderId: record.id, hostname: record.hostname, state: record.state },
  });

  return { applied: true, orderId: record.id };
}

/** Reembolso vía Stripe (best-effort) cuando la regla del registrar lo permite. */
export async function refundPayment(order: DomainOrderRecord, reason?: string): Promise<boolean> {
  if (!order.stripeCheckoutSessionId) return false;
  try {
    const session = await stripe.checkout.sessions.retrieve(order.stripeCheckoutSessionId);
    const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;
    if (!paymentIntentId) return false;
    await stripe.refunds.create({ payment_intent: paymentIntentId, reason: 'requested_by_customer' });
    await save(appendAudit(order, new Date().toISOString(), 'refunded', reason ?? 'Reembolso emitido.'));
    await save({ ...order, state: 'failed' });
    return true;
  } catch {
    return false;
  }
}

/** Cuando un dominio asociado se activa, la orden pasa a `active`. */
export async function activateOrderForDomain(siteId: string, hostname: string): Promise<void> {
  await connectToDatabase();
  const document = await DomainOrder.findOne({ siteId, hostname, state: 'configuration_pending' });
  if (!document) return;
  const active = markActive(toRecord(document), new Date().toISOString());
  if (active.applied) await save(active.order);
}

export { canTransition, isQuoteFresh };