/**
 * Núcleo del state machine de compra de dominios (testeable, sin Mongo/Stripe).
 *
 * Estados: `quoted → payment_pending → paid → registering → registered →
 * configuration_pending → active`, con `failed` y `refund_required`.
 *
 * Las transiciones están **restringidas**: cada guarda evita cobrar dos veces,
 * registrar dos veces y avanzar con datos obsoletos. Los handlers idempotentes
 * (webhook duplicado) devuelven `applied: false` sin reprocesar.
 */

export type DomainOrderState =
  | 'quoted'
  | 'payment_pending'
  | 'paid'
  | 'registering'
  | 'registered'
  | 'configuration_pending'
  | 'active'
  | 'failed'
  | 'refund_required';

export type DomainQuote = {
  registration: number;
  renewal?: number;
  currency: string;
  period: 'year';
  quotedAt: string;
};

export type AuditEvent = { at: string; event: string; detail?: string };

export type DomainOrderRecord = {
  id: string;
  userId: string;
  hostname: string;
  tld: string;
  provider: string;
  state: DomainOrderState;
  quote: DomainQuote;
  idempotencyKey: string;
  siteId?: string | null;
  stripeCheckoutSessionId?: string | null;
  registrarOrderId?: string | null;
  registrationAttempts: number;
  refundEligible: boolean;
  failedReason?: string | null;
  audit: AuditEvent[];
  createdAt: string;
  updatedAt: string;
};

/** Transiciones permitidas por estado. `paid` solo desde `payment_pending`. */
export const ORDER_TRANSITIONS: Record<DomainOrderState, DomainOrderState[]> = {
  quoted: ['payment_pending'],
  payment_pending: ['paid', 'failed'],
  paid: ['registering', 'failed', 'refund_required'],
  registering: ['registered', 'failed', 'refund_required'],
  registered: ['configuration_pending', 'failed', 'refund_required'],
  configuration_pending: ['active', 'failed'],
  active: [],
  failed: [],
  refund_required: ['failed'],
};

export function canTransition(order: DomainOrderRecord, to: DomainOrderState): boolean {
  return ORDER_TRANSITIONS[order.state].includes(to);
}

export function appendAudit(order: DomainOrderRecord, at: string, event: string, detail?: string): DomainOrderRecord {
  return {
    ...order,
    audit: [...order.audit, { at, event, detail }],
    updatedAt: at,
  };
}

export type StepResult = { applied: true; order: DomainOrderRecord } | { applied: false; reason: string; order?: DomainOrderRecord };

function step(order: DomainOrderRecord, to: DomainOrderState, at: string, event: string, detail?: string): StepResult {
  if (!canTransition(order, to)) return { applied: false, reason: `No se puede pasar de ${order.state} a ${to}.` };
  return { applied: true, order: appendAudit({ ...order, state: to }, at, event, detail) };
}

/** Marca como pagado SOLO desde `payment_pending` y con la sesión que creamos. */
export function markPaid(order: DomainOrderRecord, sessionId: string, at: string): StepResult {
  if (order.stripeCheckoutSessionId && order.stripeCheckoutSessionId !== sessionId) {
    return { applied: false, reason: 'La sesión no corresponde a esta orden.' };
  }
  if (order.state !== 'payment_pending') {
    // Webhook duplicado: ya procesado.
    return { applied: false, reason: 'La orden ya no está pendiente de pago.', order };
  }
  return step(order, 'paid', at, 'payment_confirmed', sessionId);
}

/** Inicia el registro SOLO si está pagada y aún no se registró. */
export function beginRegistration(order: DomainOrderRecord, at: string): StepResult {
  if (order.registrarOrderId) return { applied: false, reason: 'Ya existe un registro para esta orden.' };
  const next = step(order, 'registering', at, 'registration_started');
  if (!next.applied) return next;
  return { applied: true, order: { ...next.order, registrationAttempts: order.registrationAttempts + 1 } };
}

/** Marca como registrado con el id del registrar. */
export function markRegistered(order: DomainOrderRecord, registrarOrderId: string, at: string): StepResult {
  if (order.registrarOrderId) return { applied: false, reason: 'La orden ya quedó registrada.', order };
  const next = step(order, 'registered', at, 'registered', registrarOrderId);
  if (!next.applied) return next;
  return { applied: true, order: { ...next.order, registrarOrderId } };
}

export function markConfigurationPending(order: DomainOrderRecord, siteId: string, at: string): StepResult {
  const next = step(order, 'configuration_pending', at, 'associated_with_site', siteId);
  if (!next.applied) return next;
  return { applied: true, order: { ...next.order, siteId } };
}

export function markActive(order: DomainOrderRecord, at: string): StepResult {
  return step(order, 'active', at, 'activated');
}

export function failOrder(order: DomainOrderRecord, reason: string, at: string): StepResult {
  const next = step(order, 'failed', at, 'failed', reason);
  if (!next.applied) return { applied: false, reason: next.reason };
  return { applied: true, order: { ...next.order, failedReason: reason } };
}

/**
 * Marca `refund_required` y decide si el reembolso es posible. Nunca se promete
 * un reembolso si las reglas del registrar no lo permiten: si el dominio ya se
 * registró (registrarOrderId presente), el reembolso depende del registrar y se
 * marca como no elegible por defecto.
 */
export function requireRefund(order: DomainOrderRecord, reason: string, at: string): StepResult {
  const next = step(order, 'refund_required', at, 'refund_required', reason);
  if (!next.applied) return { applied: false, reason: next.reason };
  const refundEligible = !order.registrarOrderId && order.state === 'paid';
  return { applied: true, order: { ...next.order, refundEligible, failedReason: reason } };
}

/* ------------------------------------------------------------ frescura --- */

export function isQuoteFresh(order: DomainOrderRecord, now: number, maxAgeMs: number): boolean {
  const quotedAt = new Date(order.quote.quotedAt).getTime();
  return Number.isFinite(quotedAt) && now - quotedAt <= maxAgeMs;
}

/** ¿Cambió el precio entre dos cotizaciones? */
export function quoteChanged(a: DomainQuote, b: DomainQuote): boolean {
  return a.registration !== b.registration || a.currency !== b.currency;
}