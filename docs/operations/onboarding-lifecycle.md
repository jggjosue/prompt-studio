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

`enrollOnboardingLifecycle` persists lifecycle enrollment independently from manual sends. `processDueOnboardingEnrollment` derives the due step from persisted enrollment time, re-checks current consent/suppression/topic state at send time, and advances the sequence idempotently per user. A scheduler/worker can call this processor for due users without duplicating campaign policy.

The enrollment record never represents permanent permission: withdrawing consent makes subsequent steps ineligible. Purchase state is supplied from the product source of truth so paid conversion steps are suppressed after purchase.
