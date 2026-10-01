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
