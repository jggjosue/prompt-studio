# Email consent and preference data model

`UserProfile` is the product source of truth for registered-user email
preferences. Having a Clerk account is **not** promotional consent; new profiles
default to `marketingOptIn: false`.

Stored preference fields are limited to operational consent data:
`marketingOptIn`, consent timestamp/source/version, unsubscribe timestamp,
topic allowlist, locale, last preference update, and an append-only preference
change audit embedded in the profile. Sensitive personal attributes must not be
added for targeting.

Every preference mutation should go through `updateEmailPreferences`. The
audit entry records when, where and what state was selected. An unsubscribe
clears active consent metadata and sets `unsubscribeTimestamp`.

The product database remains authoritative. Resend synchronization must derive
subscription state from this model and must never turn an absent/false product
opt-in into consent. Suppression enforcement and provider-event reconciliation
are implemented in #670/#671.
