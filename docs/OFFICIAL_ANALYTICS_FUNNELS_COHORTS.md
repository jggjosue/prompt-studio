# Official analytics funnels and cohorts

Issue #239 establishes the definitions that dashboards, retention analysis and experiments must share. The executable source of truth is `src/lib/analytics-funnels.ts`.

## Official funnels

### Acquisition → purchase

`view_home → signup_started → sign_up → first_activation → view_pricing → begin_checkout → purchase`

This is the primary company conversion funnel. A stage counts only when its first occurrence is at or after the preceding stage. The denominator is unique identities entering `view_home` inside the selected analysis window.

### Prompt engagement

`view_prompt → copy_prompt → use_prompt → save_prompt`

Use this funnel to understand whether prompt discovery becomes a meaningful saved action. A user does not need to perform every intermediate action to remain generally engaged, but the **official funnel conversion** is ordered and requires the listed stages.

### Generation activation

`sign_up → first_activation`

`first_activation` is the server-confirmed first successful qualifying action. The detailed activation type remains available as event metadata.

## Official cohorts

| Cohort | Anchor | Grouping |
| --- | --- | --- |
| Signup date | `sign_up` | UTC calendar day |
| Activation date | `first_activation` | UTC calendar day |
| Acquisition source | `sign_up` | persisted `utm_source` |
| Paying date | first confirmed `purchase` | UTC calendar day |

A person's cohort anchor never moves because of a later login, repeat activation, or repeat purchase.

## Shared rules

- Timezone: UTC.
- Use the earliest valid occurrence of each stage.
- Anonymous acquisition uses the privacy-safe `anonymous_id`; registration is bridged by `identity_linked`; authenticated analysis uses the product's authenticated identity outside GA4 where required.
- Do not use email, name, prompt text or credentials as cohort keys.
- `purchase` is authoritative only from the signed Stripe webhook.
- Funnel definitions are versioned in source. Dashboards must not silently reorder or redefine stages.
- Experiment analysis should segment these official funnels/cohorts rather than create incompatible definitions.

## Relationship to retention

#240 should calculate D1/D7/D30 against these stable cohort anchors. A retention metric must state which official cohort is its denominator and which return/activation event qualifies the numerator.

## Rollback/change management

Changing an official stage or cohort definition changes metric meaning. Make such changes in this module, update this document and tests in the same PR, and annotate dashboards/reports with the definition version or deployment date.
