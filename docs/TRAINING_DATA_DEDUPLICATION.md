# Training-data deterministic deduplication

Issue #1081, parent #1072. Canonicalization version: `canonical-v1`.

Deduplication runs after `sanitizer-v1` and before writing to `processed/`. This ensures hashes represent allowed normalized content rather than original PII/secrets.

Objects are recursively serialized with lexicographically sorted keys. Array order is preserved because it can be semantically meaningful. Undefined object values are omitted and non-finite numbers fail closed. SHA-256 of the canonical UTF-8 JSON is the content hash.

Dedupe scope is dataset + canonicalization version + content hash. MongoDB collection `training_content_fingerprints` has a unique index so concurrent workers atomically select one canonical record. Later identical records are recorded in `duplicateRecordIds` and processing returns `duplicateOf=canonicalRecordId`; provenance is preserved rather than destructively deleting source records.

Retries of the same record are therefore no-ops at the processed-output layer. Dataset builders must include only canonical fingerprints. A future canonicalization change requires a new version and rebuild rather than changing historical hashes.
