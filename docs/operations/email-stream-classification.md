# Email stream classification and consent

Prompt Studio treats email as three separate streams. Code must select a stream
explicitly; lifecycle and outreach must never silently inherit the legacy
transactional sender.

| Stream | Messages | Sender config | Permission rule |
| --- | --- | --- | --- |
| Transactional | account, product/service notifications, receipts and payment/service messages | `RESEND_TRANSACTIONAL_EMAIL`, `RESEND_TRANSACTIONAL_REPLY_TO` | Send when necessary to provide the requested service or transaction. Do not add promotional content that changes the message's primary purpose. |
| Lifecycle / marketing | onboarding, recommendations, product updates, offers, reactivation | `RESEND_LIFECYCLE_EMAIL`, `RESEND_LIFECYCLE_REPLY_TO` | Requires eligibility under the product's recorded consent/preferences and applicable law. Account creation alone is not promotional consent. |
| Founder-led B2B outreach | small-volume, researched, personalized business prospecting | `RESEND_OUTREACH_EMAIL`, `RESEND_OUTREACH_REPLY_TO` | Requires a documented legitimate outreach basis appropriate to the recipient/jurisdiction, provenance for the public business contact, and do-not-contact enforcement. Never treat a scraped/imported list as newsletter consent. |

`RESEND_EMAIL` remains a temporary compatibility fallback for **transactional
mail only**. New lifecycle/outreach code must fail closed when its dedicated
sender is not configured.

Authentication and deliverability requirements are documented in
`docs/operations/resend-deliverability.md`. Consent storage, suppression and
jurisdiction-specific enforcement are implemented in the follow-up issues; this
classification is the boundary those systems must enforce.
