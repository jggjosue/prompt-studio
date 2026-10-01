# Payment lifecycle analytics

Issue #235 uses two different trust boundaries for commerce analytics.

## begin_checkout

`begin_checkout` is emitted only after the application successfully creates a Stripe checkout session/URL. A button click that fails validation, authentication, networking, or Stripe session creation is not counted.

Current explicit client paths include embedded component checkout and crowdfunding checkout. Other checkout surfaces should adopt the same semantic as they are standardized.

## purchase

A purchase must never be inferred from a browser redirect or `?checkout=success`. The signed Stripe webhook is the server-authoritative source.

After Stripe signature verification and paid-session validation, the webhook records a `purchase` analytics/observability signal containing transaction ID, categorical product information, amount/currency and the existing internal user reference when available. Email and payment credentials are excluded.

Stripe may retry webhooks. Downstream analytics consumers must use the Stripe checkout session ID as the transaction/idempotency key when exporting this server event to GA4 or a warehouse.

## Validation

Before closing #235, verify a sandbox checkout end to end: one `begin_checkout` after session creation and one confirmed `purchase` from the signed webhook, with failed checkout attempts producing neither purchase nor false conversion.
