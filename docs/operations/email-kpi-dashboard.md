# Email marketing KPI dashboard

Review this dashboard weekly. Business outcomes are primary; opens are displayed
only as a secondary directional signal because privacy features, image proxying
and client behavior make open measurement unreliable.

## Definitions

- Delivery rate = delivered / sent.
- Bounce rate = bounced / sent.
- Complaint rate = complaints / delivered.
- Unsubscribe rate = unsubscribes / delivered.
- Click-through rate = unique attributed clicks / delivered.
- Click → activation, checkout, paid = attributed outcome / attributed clicks.
- Attributed revenue = paid Stripe revenue carrying the campaign/sequence attribution.
- Reactivation rate = reactivated inactive users / eligible reactivation recipients.
- B2B reply, positive reply, demo/trial and paid rates = outcome / B2B messages sent.

## Reconciliation

Provider delivery, bounce and complaint evidence comes from Resend webhook
events. Clicks and activation come from email attribution/product funnel events.
Checkout and paid/revenue must reconcile product attribution with Stripe's
successful checkout/payment evidence. B2B outcomes reconcile against founder
outreach attempts.

Aggregate by campaign and sequence using the same attribution identifiers.
Do not count a provider event and a product/Stripe event as two conversions for
the same outcome. Preserve raw source records and persist the reconciled weekly
snapshot with its reconciliation timestamp.

The weekly reviewer records who reviewed the snapshot and when, investigates
material source mismatches, and bases campaign decisions primarily on clicks,
activation, checkout, paid revenue, reactivation and qualified B2B outcomes.
