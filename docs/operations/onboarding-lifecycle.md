# Onboarding lifecycle v1

Sequence: `onboarding_v1`, triggered for eligible `new_registered` users.

| Step | Delay | Topic | Goal |
| --- | ---: | --- | --- |
| 1 | 0h | tutorials | Welcome and fastest path to first value |
| 2 | 24h | tutorials | Free workflow matched to first image/video/web behavior |
| 3 | 72h | tutorials | Tutorial for one concrete outcome |
| 4 | 120h | offers | Explain a Premium outcome with a direct product CTA |
| 5 | 168h | offers | Paid/Premium CTA |

Every send must re-check global marketing eligibility, suppression/do-not-contact
state and the step topic. Steps 4–5 stop after a purchase. A scheduler must not
treat enrollment as permanent permission.

Every CTA is built with `buildEmailUrl` and carries `utm_source=email`,
`utm_medium=email`, campaign, sequence and trigger identifiers. Existing
email attribution events connect clicks to activation, checkout and purchase.

Plain-text output is first-class and contains the CTA plus preference and
unsubscribe links. HTML/mobile templates, when added in Resend, must preserve
the same copy hierarchy, links and attribution; preview at narrow mobile width
before publishing. Opens are not the primary KPI.

This module defines sequence policy/content and deterministic gating. Delivery
or scheduling infrastructure should call these helpers rather than duplicating
consent or purchase-stop logic.
