# D1 / D7 / D30 activation retention

Issue #240 implements retention against the official `activationDate` cohort defined by #239.

## Definition

- Denominator: unique users whose server-confirmed `first_activation` falls inside the selected cohort window.
- D1 numerator: cohort users with a successful authenticated product activity on the UTC calendar date one day after activation.
- D7 numerator: the same rule seven days after activation.
- D30 numerator: the same rule thirty days after activation.
- Rate: retained users / activation cohort size.
- Timezone: UTC.

This is **exact-day retention**, not rolling “returned at any time before D7”. The distinction must remain visible in dashboards.

## Activity ledger

Successful authenticated activation/product activity writes one row per user per UTC activity day. The unique `userId + activityDateUtc` index makes repeat actions during a day idempotent for retention counting. No email or prompt text is stored in the retention ledger.

## Access

`GET /api/admin/analytics/retention?days=30` returns the activation cohort size and D1/D7/D30 metrics. It requires an authenticated session with the admin role.

## Caveat and rollout

The ledger begins collecting when this change is deployed; it does not reconstruct historical daily activity that was never persisted. Early D7/D30 cohorts therefore need time to mature and should not be interpreted as complete until their return day has elapsed.

Rollback is safe: removing the retention write/read path does not change activation behavior. Existing ledger rows can remain inert.
