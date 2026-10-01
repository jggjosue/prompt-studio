# GA4 conversion funnel validation runbook

Issue: #634 · Taxonomy: #234

## Funnel events

The production funnel must emit these canonical events:

`view_home`, `search`, `view_prompt`, `copy_prompt`, `use_prompt`, `generate_image`, `generate_video`, `generate_web`, `signup_started`, `sign_up`, `login`, `save_prompt`, `view_premium`, `view_pricing`, `select_plan`, `begin_checkout`, `purchase`, `newsletter_signup`.

Key conversion candidates are `sign_up`, `save_prompt`, `begin_checkout`, and `purchase`.

## Data contract

All client events pass through `trackAnalyticsEvent`.

- Current UTM attribution is captured from `utm_source`, `utm_medium`, `utm_campaign`, and `utm_content`.
- UTM attribution is retained for the browser session so later funnel events remain attributable after navigation removes the query string.
- `auth_state` is one of `anonymous`, `authenticated`, or `unknown`.
- Full URLs/query strings are not sent as `page_location`; only origin + pathname is emitted.
- High-risk property names from the analytics taxonomy privacy denylist are stripped before GA4/Firebase dispatch.
- Call sites that can repeat during React navigation should supply a stable `oncePerSessionKey`.

Do not send email, name, prompt contents, credentials, tokens, API keys, authorization headers, or other direct PII.

## GA4 production configuration

This repository can define the conversion contract but cannot mutate the GA4 property configuration by source code alone. In the target GA4 property, mark these existing events as key events after they have been observed:

- `sign_up`
- `save_prompt`
- `begin_checkout`
- `purchase`

Record the property/environment and validation date in the deployment evidence.

## DebugView / Realtime validation

Production acceptance requires evidence from the deployed property. For each funnel event:

1. Use a test browser/session with GA debug mode enabled.
2. Perform the real UI action once.
3. Confirm exactly one canonical event appears in DebugView.
4. Confirm expected non-PII properties, including `auth_state` and UTM values when applicable.
5. Confirm no email, prompt text, credential, token, or query-string data is present.
6. Confirm the event appears in Realtime after ingestion.
7. For the four key events, confirm GA4 displays them as key events.

Validate at minimum one anonymous acquisition journey and one authenticated journey through checkout/purchase in the appropriate test/sandbox payment environment.

## Release gate

Do not close #634 based only on code/tests. Closure requires deployed GA4 DebugView/Realtime evidence and verification of the four GA4 key-event settings.
