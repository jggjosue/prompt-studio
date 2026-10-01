# Resend webhook ingestion

Endpoint: `POST /api/webhooks/resend`.

The endpoint reads the raw request body and verifies the Resend/Svix signature
with the server-only `RESEND_WEBHOOK_SECRET`. Missing or invalid signatures
are rejected before any database write. Never expose this secret through
`NEXT_PUBLIC_*` variables or client code.

Handled events persist only the provider event ID, event type, Resend email ID,
recipient, occurrence time and receipt time. The unique
`(provider, eventId)` index makes replay/retry processing idempotent.

Delivery and click events are recorded. Hard bounces, complaints and explicit
provider unsubscribe updates additionally apply the shared suppression state
from #670. Transient bounces are not treated as permanent suppression.

Processing failures are reported through server observability and return 503 so
the provider can retry. A retry that already persisted the event returns
success without applying side effects twice.
