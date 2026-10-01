# Email event attribution

Email success is measured from delivery/click through product activation,
checkout and purchase. Opens are intentionally not a primary KPI.

Canonical provider events are mapped to `email_sent`, `email_delivered`,
`email_bounced`, `email_complained`, `email_clicked` and
`email_unsubscribed`. Product-side downstream events are
`email_activation`, `email_checkout` and `email_purchase`.

All campaign links use `utm_source=email`, `utm_medium=email`,
`utm_campaign=<campaign>`, plus non-PII `email_campaign`,
`email_sequence` and `email_trigger` tokens. These tokens let product
analytics join activation/checkout/purchase to a campaign or sequence without
sending recipient email addresses or provider contact IDs to GA4.

Provider event storage may retain the minimal recipient value required for
operational suppression. That operational record is server-side and is not a
GA4 payload. Product attribution records store campaign/sequence/trigger,
timestamps and optional purchase value/currency, not recipient PII.


## Downstream persistence

Product handlers can call `recordEmailFunnelEvent` for activation, checkout and
purchase when they have the landing/current URL that carried the email
attribution tokens. The recorder accepts only valid email attribution generated
from `email_campaign` + `utm_campaign`, stores no recipient identifier, and
uses a SHA-256 event key derived from event type + source event ID + campaign to
make webhook/retry processing idempotent.

Purchase attribution may additionally persist value/currency. Callers should
use the provider/product event ID as `sourceEventId`; never use an email
address, name or other PII as that ID.
