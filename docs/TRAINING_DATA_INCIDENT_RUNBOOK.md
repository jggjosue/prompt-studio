# Training-data incident runbook

Use this runbook for operational incidents in the #1072 pipeline.

## Failed release
1. Treat the attempted version as failed; never overwrite/reuse it.
2. Read the structured error and validation issue codes. Do not dump dataset rows into logs.
3. If validation failed, correct the producer/builder and rebuild with a new version.
4. If R2 upload failed mid-release, verify credentials/network/bucket access, then use a new version.
5. A release is published only after the release command completes post-upload verification.

## Non-empty DLQ
1. Stop automated redrive while the cause is unknown.
2. Classify failures from safe metadata/error codes.
3. Confirm affected source records are still consented and eligible.
4. Fix the worker/contract/infrastructure issue.
5. Redrive only eligible messages; acknowledge/drop revoked or permanently invalid records.
6. Confirm DLQ returns to zero and processing latency recovers.

## High rejection/failure rate
Compare the rate with recent deployment/schema/policy changes. Inspect reason-code aggregates, never rejected content. Roll back or patch the faulty producer if the spike is systemic. Do not lower sanitizer/privacy gates simply to reduce the rejection metric.

## Queue backlog
Check worker availability, SQS access, R2/Mongo connectivity and latency. Scale processing only within configured infrastructure limits. Keep idempotency/dedupe active during recovery.

## Revocation incident
Immediately mark affected source records revoked. Identify dataset releases whose lineage can contain them. Stop selecting those releases for new training and build a corrected immutable version using the revocation rebuild command. Preserve historical artifacts only for controlled audit/lineage according to retention policy.

## Credential exposure
Do not place exposed credentials in issues/logs. Rotate the credential through the owning provider, update the runtime secret, verify access, and inspect audit logs. Dataset application logs intentionally do not contain credential values.
