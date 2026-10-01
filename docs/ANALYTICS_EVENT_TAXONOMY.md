# Product analytics event taxonomy

Issue: #234 · Parent epic: #233

This document is the approved naming and data contract for Prompt Studio product analytics. The executable source of truth is `src/lib/analytics-taxonomy.ts`.

## Naming contract

New events use lower-case `snake_case` and describe an observable user/product action. Do not create provider-specific names such as `ga_*`, `firebase_*`, or hosting-specific names. GA4/Firebase is a destination, not the taxonomy.

Legacy `web_*` and older component events remain accepted temporarily so existing instrumentation does not break. They are frozen: new call sites must use a canonical event instead. Migration/removal can happen incrementally after the funnel is validated.

## Canonical funnel

Discovery:
`view_home → search → view_prompt → copy_prompt/use_prompt`

Activation:
`signup_started → sign_up → login → save_prompt/generate_image/generate_video/generate_web`

Monetization:
`view_premium/view_pricing → select_plan → begin_checkout → purchase`

Site builder:
`site_created → template_selected/component_added → ai_site_generated/ai_component_edited → preview_opened → site_published`

Domains:
`custom_domain_started/domain_search → domain_checkout_started → domain_purchased/custom_domain_connected`

Lifecycle:
`newsletter_signup`, `marketing_consent_updated`, `user_library_return`.

The detailed implementation of these funnels belongs to #235/#239; this issue defines the shared vocabulary.

## Standard properties

Prefer the shared properties exported by the taxonomy: page/resource IDs and names, category, membership, monetary value/currency, action source, auth state and UTM attribution. Keep property semantics stable across events.

Use opaque internal IDs where an identifier is necessary. Do not use an email address as an analytics identifier.

## Privacy contract

Analytics must never contain direct PII, private prompt contents, credentials or secrets. In particular, do not send email, name, prompt/prompt_text, password, tokens, API keys or authorization headers. #238 owns the broader privacy enforcement work.

## Conversions

The approved key-conversion candidates in code are:
- `sign_up`
- `save_prompt`
- `begin_checkout`
- `purchase`

Whether/how each is configured in GA4 production is validated by #634.

## Change process

Any new event must:
1. represent a product question not already answered by an existing event;
2. use canonical snake_case naming;
3. be added to the executable taxonomy and tests;
4. document any new property semantics;
5. avoid PII/private content;
6. preserve backwards compatibility or include an explicit migration.

Dashboards and experiments must consume this contract rather than inventing local event names.
