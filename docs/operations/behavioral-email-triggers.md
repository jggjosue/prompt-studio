# Behavioral lifecycle triggers

Issue #676 introduces a small, idempotent trigger boundary between product
behavior and lifecycle delivery.

Supported triggers are signup without activation after 24 hours, saved prompt,
image/video/web generation, repeated Premium/pricing views, checkout without a
purchase, inactivity at 7/30 days and completed purchase. Each maps to a
measurable product objective in `behavioral-email-triggers.ts`.

## Safety and frequency

The processor uses `userId + trigger + sourceEventId` as a unique idempotency
key. Concurrent duplicate processing is handled by the database unique index.
A user may receive at most one lifecycle trigger in 24 hours and three in seven
days. A completed purchase cancels pricing and checkout sales nudges.

The protected POST endpoint requires the same cron/admin authorization used by
other operational routes. Producers should send stable source event IDs from
the product event that caused the trigger. Do not put email addresses, payment
details or prompt contents in source IDs.

## Delivery boundary

This processor records eligibility and trigger outcomes. Actual message
delivery remains behind the lifecycle sender, where consent, suppression,
do-not-contact state and topic preferences must be rechecked immediately before
sending. An `outcome=sent` here means the trigger was admitted to delivery;
provider delivery/click/purchase measurement remains in the email event and
attribution pipeline.
