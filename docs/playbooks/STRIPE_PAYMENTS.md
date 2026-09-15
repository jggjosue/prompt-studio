# Stripe Payments and Subscriptions Playbook

Use this playbook when changing checkout metadata, subscriptions, credit packs, purchases, refunds, receipts, or Stripe webhooks.

## Payment flow

```mermaid
flowchart LR
    C[Checkout route] --> S[Stripe Checkout]
    S --> W[/api/webhooks/stripe]
    W --> V[verify raw-body signature]
    V --> T{event type}
    T --> P[purchase / credit / subscription update]
    P --> M[(MongoDB)]
    P --> O[observability + receipt]
```

- Lazy Stripe client and subscription metadata: [`src/lib/stripe.ts`](../../src/lib/stripe.ts)
- Checkout construction helpers: [`src/lib/stripe-checkout.ts`](../../src/lib/stripe-checkout.ts)
- Signature verification and event dispatcher: [`webhooks/stripe/route.ts`](../../src/app/api/webhooks/stripe/route.ts)
- Credit top-up idempotency and refunds: [`credit-topup.ts`](../../src/lib/credit-topup.ts)
- Subscription reconciliation and plan gates: [`server-subscription-status.ts`](../../src/lib/server-subscription-status.ts)
- Purchase records: [`CreditPurchase.ts`](../../src/models/CreditPurchase.ts) and [`ComponentPurchase.ts`](../../src/models/ComponentPurchase.ts)

## Handled event families

The webhook processes completed/failed checkout sessions, subscription updates/deletions, paid invoices, and refunded charges. Unknown events are acknowledged without mutating data.

## Invariants

1. Verify `stripe-signature` against the unmodified request body before parsing the event.
2. Treat webhook delivery as at-least-once; every mutation must be idempotent.
3. `stripeCheckoutSessionId` remains unique for purchase and credit records.
4. Send a receipt only after the database record wins its atomic send marker.
5. Derive entitlements server-side; never trust plan or price fields from the browser.
6. Record refunds against the payment intent and revoke the corresponding paid state.

## Safe change procedure

1. Add server-owned metadata when creating the Checkout session.
2. Handle the event in [`webhooks/stripe/route.ts`](../../src/app/api/webhooks/stripe/route.ts) using an idempotent filter/upsert.
3. Update the relevant model index before relying on a new uniqueness guarantee.
4. Emit a sanitized observability event without secrets or full payment payloads.
5. Test both first delivery and duplicate delivery, plus failure/refund behavior.

## Verification

```bash
node --import tsx --test tests/unit/credit-topup.test.ts
node --import tsx --test tests/unit/api-security-contracts.test.ts
npm run typecheck
```

