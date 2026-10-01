# B2B prospect CRM

This collection supports lightweight founder-led prospecting. Store only the
business data needed to decide whether a company is relevant and to conduct
legitimate outreach: company/site, segment/region, a public business contact and
role, use case, minimal personalization/qualification notes and outreach state.

Every record must retain a source URL and source type. Do not enrich records
with sensitive personal data or use sensitive traits for targeting. Avoid
private/personal contact details when a public business channel is available.

The dedupe key combines normalized company, website host and public business
contact so repeated discovery does not create repeated outreach records.
Outreach code must check `doNotContact` and `deletedAt` immediately before
sending.

A do-not-contact request closes the prospect and is durable. Deletion removes
the contact and free-text targeting notes while retaining a minimal tombstone
and dedupe identity needed to prevent accidental re-collection/re-contact.
