# Clerk authentication analytics

The authentication funnel uses three privacy-safe client events:

- `signup_started`: first render of the Clerk sign-up surface.
- `sign_up`: anonymous → authenticated transition completed on that sign-up surface.
- `login`: anonymous → authenticated transition completed on the sign-in surface.

Properties identify only the provider/surface and auth state. Email, Clerk user ID,
name and other direct PII must not be sent to GA4.

## First activation

Activation is the first authenticated meaningful product action after registration:
`save_prompt`, `use_prompt`, `generate_image`, `generate_video`, or
`generate_web`. POST that action name to `/api/analytics/activation`. The
server stores one activation row per Clerk user using a unique index and
`$setOnInsert`, so retries cannot create a second first activation.

The product actions still need to call this endpoint when they succeed. Validate
signup/login in GA4 DebugView and verify an existing signed-in user who merely
visits an auth page is not counted as a new signup before closing #635.
