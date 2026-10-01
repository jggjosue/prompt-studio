# Analytics event deduplication and idempotency

Issue #237 defines two idempotency boundaries.

## Browser events

`trackAnalyticsEvent` accepts an optional `idempotencyKey`. The key is namespaced by canonical event name and persisted in first-party local storage. Re-renders, route remounts and reloads therefore do not resend the same logical event when callers supply the same key.

`oncePerSessionKey` remains available for events whose intended cardinality is once per browser session. The anonymous-to-registered identity bridge uses its anonymous journey UUID as an explicit idempotency key.

## Server events

Payment confirmation cannot rely on browser storage. Stripe can retry signed webhooks across processes, deployments and regions.

Confirmed purchases claim a MongoDB `AnalyticsEventReceipt` using the Stripe Checkout Session ID as a namespaced purchase key. The receipt has a unique index and is inserted with `$setOnInsert`. Only the process that creates the receipt emits the purchase analytics signal; retries return without a duplicate conversion.

Receipts expire after 90 days to bound storage while covering normal webhook retry/replay windows.

## Rollback and validation

The ledger contains event keys/categories only, not email, prompt text or payment credentials. Removing this analytics dedupe layer does not alter Stripe fulfillment or authentication.

Production validation should replay the same Stripe sandbox event and verify that only one purchase analytics signal is recorded.
