# Training-data sanitization and rejection

Issue #1080, parent #1072. Sanitizer version: `sanitizer-v1`.

Every normalized record passes through the sanitizer before `processed/`. The pipeline fails closed.

Redactable PII in v1: email addresses, phone-like values and IPv4 addresses. Accepted records contain placeholders such as `[REDACTED_EMAIL]`; the original value is not written to the processed object.

Rejected in v1: recognized API/private-key patterns, credential-shaped fields (`password`, `secret`, `apiKey`, access/refresh tokens, private keys), malformed JSON values and normalized payloads above 256 KiB.

Rejected objects under `rejected/YYYY/MM/DD/{entityType}/{recordId}.json` contain only record identity, reason codes, sanitizer version and rejection timestamp. They intentionally do not copy the offending content or finding values.

This sanitizer is a deterministic baseline, not a claim of perfect PII detection. #1089 dataset validation must test leakage before release. Future detector revisions require a new sanitizer version and dataset rebuild; old immutable releases are never silently modified.
