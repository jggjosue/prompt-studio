# GA4 conversion funnel validation

Canonical funnel events are: `view_home`, `search`, `view_prompt`,
`copy_prompt`, `use_prompt`, `generate_image`, `generate_video`,
`generate_web`, `signup_started`, `sign_up`, `login`, `save_prompt`,
`view_premium`, `view_pricing`, `select_plan`, `begin_checkout`,
`purchase`, and `newsletter_signup`.

Client events attach page context, privacy-safe `auth_state`, and inbound
`utm_source`, `utm_medium`, `utm_campaign`, and `utm_content`. Do not
send email, name, Clerk user ID, or other direct identifiers to GA4.

Mark `sign_up`, `save_prompt`, `begin_checkout`, and `purchase` as key
events in the GA4 property. That is an analytics-property configuration step,
not something this repository can truthfully claim to have changed.

## Production checklist

1. Open GA4 DebugView with a production/test browser session.
2. Exercise anonymous home/search/prompt discovery and verify each event once.
3. Sign up/login, save a prompt, and perform one generation of each supported
   image/video/web flow.
4. Visit Premium/pricing, select Creator and begin checkout.
5. Complete a controlled Stripe purchase and verify `purchase` once with
   value/currency.
6. Verify newsletter consent emits `newsletter_signup` without PII.
7. Confirm UTMs and `auth_state` are queryable on representative events.
8. Confirm the four key events above are configured in GA4 Admin.

Record the validation date/property and any missing event before closing #634.
