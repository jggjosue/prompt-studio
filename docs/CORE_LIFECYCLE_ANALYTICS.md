# Core lifecycle analytics

Issue #235 instruments the product lifecycle actions that must represent **successful outcomes**, not button intent.

## Event semantics

- `signup_started`: user reaches the Clerk sign-up surface.
- `sign_up`: Clerk authentication transitions from signed out to signed in on the sign-up surface.
- `login`: equivalent transition on the sign-in surface.
- `save_prompt`: authenticated save request succeeds. Removing an item does not emit this event.
- `generate_image`: image generation reaches a completed output.
- `generate_video`: video generation reaches a completed output.
- `generate_web`: web generation reaches a completed output.

Payment funnel events remain owned by the checkout/purchase instrumentation and #634 validation contract. Do not emit `purchase` from a click; it must correspond to confirmed payment state.

## Privacy

Do not include prompt contents, email addresses, credentials, API keys or provider tokens in lifecycle analytics. Resource IDs may be included only as opaque product IDs.

## Failure behavior

Failed saves and failed/timed-out generations do not emit success events. Existing operational telemetry remains responsible for failure observability.

## Rollback

The instrumentation is client-side and can be rolled back independently without changing the underlying save/generation behavior.
