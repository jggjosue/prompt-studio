# Stripe / analytics / credit-ledger reconciliation

Issue #241 extends the existing read-only Prompt Credit reconciliation so the three financial views can be compared from one audit:

1. **Stripe-derived purchases** in `CreditPurchase`.
2. **Purchase analytics receipts** created by the signed Stripe webhook.
3. **Credit grants and balances** in `AICreditLedger` / `AICreditAccount`.

## Checks

For every credit purchase the audit verifies:
- a server-authoritative Stripe purchase analytics receipt exists;
- a credited purchase has its `TOPUP_PURCHASE` ledger grant;
- granted credits equal purchased credits;
- refunded purchases with remaining exposure are visible;
- account buckets and reservations reconcile to their totals.

`STRIPE_PURCHASE_MISSING_ANALYTICS` is a warning because historical purchases may predate analytics receipts. Ledger/balance inconsistencies remain critical.

## Safety

The reconciliation endpoint remains admin-only and read-only. It never repairs balances or synthesizes analytics automatically. This prevents an audit run from changing financial state.

## Operations

Use the admin credit-reconciliation page after Stripe/webhook or credit-ledger changes. Investigate critical findings before manually repairing data. Missing historical analytics receipts should be explained/backfilled only through a separately reviewed migration rather than fabricated by this audit.
