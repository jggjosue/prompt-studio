# Inactive-user reactivation

Reactivation uses two distinct lifecycle paths: 7 days inactive and 30 days
inactive. The 7-day message is the first reminder. A 30-day message may be sent
once after that; users with two prior reactivation attempts receive no further
reactivation mail until product activity resets the lifecycle state.

Candidates must remain eligible for non-transactional lifecycle mail.
Purchasers, unsubscribed, suppressed and DNC contacts are excluded before
delivery. Eligibility should be rechecked immediately before the provider send.

When prior behavior is known, the CTA and concrete return reason are
personalized for image, video, web or saved-prompt activity. Unknown behavior
falls back to the general workspace. Links use standard campaign/sequence/
trigger attribution.

Each attempt records return login, activation, checkout and purchase timestamps
so the campaign is evaluated on downstream product behavior rather than opens.
The unique user/window constraint prevents duplicate 7-day or 30-day sends.

A new meaningful product session should be treated as a new activity baseline;
the inactivity detector owns that reset and must not infer inactivity solely
from email engagement.


## Runtime processing

`processInactiveReactivationBatch` now discovers users whose activity baseline is
at least seven days old, resolves the 7d/30d window, segments by the prior
image/video/web/prompt category when available, and invokes the lifecycle
sender. Consent, suppression, DNC and the `product_updates` preference are
rechecked immediately before provider delivery. A `ReactivationAttempt` is
persisted only after a successful send; the existing unique user/window index
prevents duplicate campaign sends.

The processor is intentionally a callable worker primitive. Production
scheduling should invoke it from the deployment's authenticated job/cron
surface and separately write return-login, activation, checkout and purchase
timestamps as those product events occur.
