# Resend deliverability and domain-authentication runbook

This runbook is the operational source of truth for issue #667. It deliberately
contains no production DNS values, API keys, or signing secrets.

## Sending identities

Keep the three mail classes logically separate so a marketing or outreach
incident cannot unnecessarily damage critical transactional delivery.

| Stream | Recommended identity | Purpose |
| --- | --- | --- |
| Transactional | `transactional.<production-domain>` | receipts, account/product/service notifications |
| Lifecycle / marketing | `updates.<production-domain>` | onboarding, product updates, offers |
| Founder-led B2B | `outreach.<production-domain>` | low-volume, personalized prospecting |

The exact domains and mailbox names are deployment configuration, not source
code. Each From address and Reply-To mailbox must be monitored by a person or a
shared operational inbox. Do not use a no-reply address when a reply is a
reasonable user action.

## Production verification checklist

Complete this checklist in the Resend dashboard and authoritative DNS provider
before marking #667 complete.

- [ ] Every production sending domain/subdomain is **Verified** in Resend.
- [ ] Resend DKIM records are present and pass validation.
- [ ] The SPF configuration required by Resend is present and there is no
      accidental second SPF TXT policy for the same hostname.
- [ ] DMARC is published for the organizational domain. Start with a monitoring
      policy if needed, review reports, then tighten deliberately.
- [ ] Alignment is checked for the visible From domain against authenticated
      SPF/DKIM identifiers.
- [ ] Transactional, lifecycle/marketing, and founder-led outreach identities
      are documented in the deployment inventory.
- [ ] Every From and Reply-To mailbox is monitored.
- [ ] Representative transactional and marketing templates pass Resend
      Deliverability Insights without unresolved high-severity findings.
- [ ] A real inbox smoke test is performed for each production stream.
- [ ] Bounce/complaint handling ownership is assigned.

Do not paste DNS record values into this repository. Resend and the DNS provider
remain the source of truth for those values.

## DMARC rollout

1. Publish DMARC at `_dmarc.<production-domain>` with an address controlled by
   Prompt Studio for aggregate reports.
2. Begin with monitoring while legitimate senders are inventoried.
3. Confirm Resend traffic aligns and investigate unknown legitimate senders.
4. Move to quarantine/reject only after reports show that required senders are
   aligned.
5. Re-check after adding or changing any email provider.

DMARC policy changes are DNS operations and require an operator with domain
access. They must not be automated from application code.

## Deliverability Insights procedure

For each representative template:

1. Open the template/message in Resend and run Deliverability Insights.
2. Record the date, stream, template identifier, and pass/fail result in the
   deployment/operations record (never include recipient PII).
3. Resolve authentication, link, content, sender, or formatting findings.
4. Re-run until no high-severity finding remains.
5. Send a smoke test to at least two independent mailbox providers and verify
   sender display, Reply-To, links, plain-text fallback where applicable, and
   spam-folder placement.

Repeat after sender-domain changes or substantial template changes.

## Ownership and recovery

- **DNS ownership:** the account/team controlling the production domain.
- **Resend ownership:** the production Resend workspace administrators.
- **Application ownership:** maintainers of `src/lib/resend.ts` and
  `src/lib/transactional-email.ts`.
- **Secret rotation:** follow `docs/security/resend-secret-management.md`.

Recovery after an authentication incident:

1. Pause non-transactional sends if domain authentication or reputation is in
   doubt; preserve essential transactional mail only when authentication is
   known-good.
2. Compare the current authoritative DNS records with the records Resend
   currently requests.
3. Restore missing/changed records in the DNS provider; never recover them from
   a commit or issue.
4. Wait for DNS propagation and require Resend to report the domain as verified.
5. Run Deliverability Insights and stream smoke tests.
6. Resume lifecycle/outreach gradually while watching bounce and complaint
   signals.

## Repository-side audit

Run:

```bash
npm run verify:resend-deliverability
npm run verify:resend-secrets
```

The deliverability audit checks the repository contract only: required
server-side environment variable names, sender usage, and the existence of this
runbook. It cannot prove live DNS or Resend account state; the dashboard/DNS
checklist above is required for that.
