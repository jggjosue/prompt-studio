# Clerk authentication and first-activation analytics

Issue #635 connects authentication to the activation funnel without sending Clerk profile data to analytics.

The auth surface emits `signup_started`, then emits `sign_up` or `login` only on a signed-out → signed-in transition on the corresponding Clerk surface. An already authenticated visitor is therefore not counted as a new signup.

## First activation

Canonical event: `first_activation`.

The first activation is the first authenticated, successful product action among:
`save_prompt`, `use_prompt`, `generate_image`, `generate_video`, or `generate_web`.

The existing authenticated `POST /api/analytics/activation` endpoint owns deduplication. MongoDB uses `$setOnInsert` keyed by Clerk user ID and returns `firstActivation: true` only for the first recorded activation. The browser emits `first_activation` only after that server confirmation.

The initial wiring in this change connects successful `save_prompt` to that contract. Other qualifying actions can call the same helper as their authenticated success paths are standardized.

## Privacy

GA4 receives only privacy-safe categorical metadata such as Clerk as auth source, auth surface, activation type, and authenticated state. Email, display name, Clerk user ID, prompt text, credentials and tokens are not analytics properties.

## Validation

Production acceptance should verify signup, login and first activation in GA4 DebugView/Realtime, including that an existing authenticated user does not create a new `sign_up` and repeat activation actions do not create another `first_activation`.
