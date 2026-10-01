# Checkout abandonment recovery

Checkout recovery is lifecycle marketing, not a transactional receipt. It is
therefore sent only to recipients who remain eligible for lifecycle mail and
have the `offers` topic enabled.

A first-party checkout producer calls the protected scheduling endpoint with a
stable checkout/session ID, user ID, email, product ID and optional plan ID.
The unique checkout ID makes enrollment replay-safe. Recovery is scheduled one
hour after `begin_checkout`; no recovery is created when a purchase is already
known.

The CTA deep-links to the same product/plan and includes the standard email
campaign, sequence, trigger and UTM parameters. No card, payment method,
billing address or other sensitive payment data is stored in the recovery
record or included in the message.

Purchase handlers must call `cancelCheckoutRecoveryAfterPurchase` with the
checkout/session ID as soon as payment is confirmed. The record then stores
purchase time, recovered revenue and currency for attribution. A purchase
always wins over a pending recovery.

The repository has multiple checkout producers. They should call the protected
endpoint (or the scheduling service server-side) immediately after Stripe
returns a session ID; this avoids coupling recovery policy to any one product
checkout implementation.
