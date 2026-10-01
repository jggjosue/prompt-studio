# Public B2B prospect research pipeline

This workflow is selective company research, not bulk contact harvesting.

## Source gate

Before collection, record the exact public source URL and verify that the source
is permitted for the intended research/use. Respect site terms, robots/access
rules and the source's published or operational rate limit. A source is rejected
when it requires authentication, CAPTCHA solving, paywall bypassing or any other
technical-control circumvention. Do not attempt a workaround.

Research the company first: segment, region, use case and a concrete
qualification reason. A public business contact may be added only after the
company is qualified and only when it is genuinely public and useful for
business outreach. Do not collect sensitive/private data or sensitive traits.

## Human review gate

New candidates are staged with `reviewStatus=pending` and
`outreachAllowed=false`. No downstream outreach job may use a candidate until
a human reviewer explicitly approves it. Rejection keeps outreach disabled.

Approval does not override the B2B CRM's do-not-contact/deletion controls.
Before outreach, the downstream sender must still deduplicate against the CRM
and re-check suppression/do-not-contact state.

Every staged candidate retains source URL/type, discovery time, use case and
qualification reason so provenance and the basis for outreach remain auditable.
