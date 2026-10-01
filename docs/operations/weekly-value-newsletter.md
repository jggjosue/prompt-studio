# Weekly value newsletter

The weekly broadcast is a value-first lifecycle message for subscribed users.
Every issue contains a useful prompt/workflow, a short tutorial, one concrete
creation example and a product update. An offer is optional and must remain
contextual rather than becoming the primary content.

## Audience and delivery

Use a Resend Broadcast targeted to the newsletter-eligible segment after the
normal contact reconciliation has removed suppressed, unsubscribed, DNC and
otherwise ineligible contacts. Topic/consent eligibility must be checked before
adding a contact to the segment; the broadcast must not be sent to a raw user
list.

Each issue gets a stable `weekly_value_<issue>` campaign ID. Links carry the
standard email campaign, sequence, lifecycle trigger and UTM parameters so the
existing event pipeline can measure clicks, activation, checkout and purchase.
Unsubscribe remains measured by the Resend webhook pipeline.

## Success metrics

Primary metrics are useful downstream actions: clicks, activation, checkout,
purchase/revenue and unsubscribe rate. Opens are diagnostic only and must not
be the primary optimization target.

Before release, complete the email template QA checklist and perform a provider
test send. Store the Resend Broadcast ID on the issue record before production
send so retries cannot create an untracked duplicate.
