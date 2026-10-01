# Analytics event deduplication and idempotency

Issue #237 defines two idempotency boundaries.

## Browser events

`trackAnalyticsEvent` accepts `idempotencyKey` and `oncePerSessionKey`. Each key is claimed synchronously in an in-memory set before any analytics provider dispatch, then persisted in localStorage or sessionStorage. This blocks React re-entry, rapid duplicate callbacks, remounts and reloads from sending the same logical event when callers reuse a stable business key.

The anonymous-to-registered identity bridge uses its anonymous journey UUID as an explicit idempotency key.

## Server events

Stripe can retry signed webhooks across processes, deployments and regions, so payment confirmation cannot rely on browser state.

Confirmed purchases atomically claim MongoDB `AnalyticsEventReceipt` with `$setOnInsert` and a unique key derived from the Stripe Checkout Session ID. A duplicate webhook exits without another conversion. Successful delivery marks the receipt `completed`. If analytics delivery throws while the receipt is still `processing`, the claim is removed so a Stripe retry can attempt delivery again instead of permanently losing the event.

Receipts expire after 90 days to bound storage.

## Operational rule

Idempotency means one logical event per business operation, not one event per HTTP request or UI callback. Provider retries must reuse the same stable key.

## Rollback and validation

The ledger contains event keys/categories only, not email, prompt text or payment credentials. The lifecycle fields are additive and rolling back application code does not require deleting existing receipts.

Production validation should replay the same Stripe sandbox event and verify one purchase analytics signal, then simulate an analytics-delivery failure and verify a later retry can complete it.
