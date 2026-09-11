# SOP — Venta, cobro, reembolso y afiliados

Flujos que mueven dinero. Implementados en
[`src/app/api/webhooks/stripe/route.ts`](../../src/app/api/webhooks/stripe/route.ts),
[`src/app/api/component-checkout/route.ts`](../../src/app/api/component-checkout/route.ts)
y [`src/lib/affiliate.ts`](../../src/lib/affiliate.ts).

## 1. Principio que gobierna todo lo demás

**El precio lo pone el servidor.** Ningún importe llega desde el cliente: el
checkout usa `unit_amount: product.priceCents` leído del catálogo en servidor.
Un cliente manipulado no puede alterar lo que se cobra.

Si alguna vez aparece un `body.price` en una ruta de checkout, es un fallo de
seguridad, no una funcionalidad.

## 2. Modelos de venta

**Suscripción** — `free` ($0), `premium` ($9/mes, $54/año), `startup`
($1.000/mes, $10.000/año). El estado vive en Clerk Billing y Stripe.

**Compra unitaria** — planes de web con precio fijo: mini $5, entrepreneur $10,
professional $15, business $20, premium $35, elite $50, corporate $100,
advanced $200, master $500.

Cada recurso lleva `membership` (`Free` o `Premium`). Reparto actual: 223 libres
y 312 premium.

## 3. Cobro

El cobro se confirma **por webhook, nunca por redirección del navegador**. Un
usuario que cierra la pestaña tras pagar debe recibir su compra igual.

Eventos manejados:

| Evento de Stripe | Efecto |
|---|---|
| `checkout.session.completed` | Alta de la compra |
| `checkout.session.async_payment_succeeded` | Igual, para métodos diferidos |
| `checkout.session.expired` | Se registra el abandono en observabilidad |
| `checkout.session.async_payment_failed` | Igual |
| `customer.subscription.updated` / `.deleted` | Cambio de plan |
| `invoice.paid` | Renovación; puede generar comisión de afiliado |
| `charge.refunded` | La compra pasa a `refunded` |

**Verificación de firma obligatoria** con `stripe.webhooks.constructEvent`. Un
webhook sin firma válida se rechaza antes de tocar la base.

**Protección contra reentrega**: `stripeCheckoutSessionId` es único en
`ComponentPurchase`. Stripe reintenta los webhooks que no responden 2xx; sin ese
índice, un reintento duplicaría la compra.

Todo webhook procesado deja un evento `stripe / webhook_processed`; los fallos,
un `webhook_handler_error` con huella para agrupar repeticiones.

## 4. Entrega

Los recursos comprados se entregan como ZIP mediante **token firmado ligado a la
compra y al usuario**. Se comprueba, en la misma operación atómica:

- Que el token es válido y no manipulado.
- Que `payload.userId` coincide con el usuario de la sesión.
- Que la compra está en `status: 'paid'`.
- Que `downloadCount < maxDownloads` (5 por defecto), incrementando el contador.

Hacerlo atómico evita que dos peticiones simultáneas pasen ambas el último cupo.

## 5. Reembolso

Se dispara desde Stripe (`charge.refunded`), no desde la plataforma: la decisión
de reembolsar se toma en el panel de Stripe y el sistema reacciona marcando
`status: 'refunded'` por `stripePaymentIntentId`.

Consecuencia a tener presente: **marcar la compra como reembolsada no revoca los
enlaces de descarga ya emitidos**. Si el reembolso responde a un abuso, hay que
rotar `PURCHASE_DOWNLOAD_SECRET`, lo que invalida *todos* los enlaces vivos, no
solo los de esa compra.

La política publicada es de no reembolso; este flujo cubre las excepciones que
se decidan caso por caso.

## 6. Programa de afiliados

Comisión: **20 %** (`AFFILIATE_COMMISSION_PERCENT`).

### Alta

Solicitud en `/affiliate-program` → `AffiliateApplication` con estado
`pending`. Revisión manual desde `/dashboard/affiliate-applications`, que
transita a `reviewed`, `approved` o `rejected`. No hay aprobación automática.

### Registro de clics

Cada clic atribuido crea o actualiza un `AffiliateClick`. El índice único
`{ referrerUserId, visitorKey, productId, source }` es la **deduplicación**: un
visitante que recarga la página no infla el contador del afiliado.

La ruta es pública y por tanto lleva límite de 5 peticiones por minuto y por IP,
para que no se pueda inflar por script.

### Conversión

Al confirmarse una venta atribuida se crea un `AffiliateSale` con
`commissionRate` y `commissionCents` **congelados en ese momento**. Si mañana
cambia el porcentaje, las comisiones ya devengadas no se recalculan.

Dos ejes de estado, independientes a propósito:

- `status`: `pending` | `paid` | `pending_settlement` — el cobro al cliente.
- `payoutStatus`: `available` | `paid_out` | `on_hold` — el pago al afiliado.

Una venta cobrada al cliente puede seguir retenida para el afiliado, por ejemplo
mientras corre la ventana de reembolso.

`stripeCheckoutSessionId` y `stripeInvoiceId` son únicos y *sparse*: una venta
llega por checkout o por factura, nunca por las dos vías.

### Pago

Método en `AffiliatePayoutAccount` (PayPal). Por encima de un umbral, el
afiliado puede solicitar pago manual (`canRequestManualPayout`).

### Métricas

`AffiliateUserStats`, `AffiliateDailyStats` y `AffiliateReferralStats` son
**agregados derivados**. Si divergen de la realidad, la verdad está en
`AffiliateClick` y `AffiliateSale`, y los agregados se reconstruyen.

## 7. Comprobaciones periódicas sugeridas

| Frecuencia | Qué |
|---|---|
| Semanal | Ventas con `payoutStatus: on_hold` cuya ventana de reembolso ya pasó |
| Semanal | Solicitudes de afiliado en `pending` más de 7 días |
| Mensual | Cuadrar `AffiliateSale` contra los pagos reales de Stripe |
| Mensual | Compras con `downloadCount = 0` pasados 30 días — cliente que pagó y no descargó |
