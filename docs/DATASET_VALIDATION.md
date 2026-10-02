# Dataset release validation

Issue #1089, parent #1072. Validation version: `validation-v1`.

Validation runs after build/split/manifest generation and before any immutable R2 release object is written.

Critical failures block publication:
- corrupt/non-object JSONL rows;
- missing schemaVersion or exampleId;
- duplicate exampleId above the configured threshold (default 0);
- the same request/source grouping key appearing in multiple splits;
- generation outputs that are not Cloudflare R2 references or that embed body/data payloads;
- manifest split/total counts that differ from parsed JSONL;
- train/validation/test/manifest SHA-256 mismatches.

The validator intentionally operates on already consent-gated, sanitized processed data. Consent eligibility is enforced upstream before a record can enter processed storage; release filters in the manifest record that gate. Future external-data ingestion must provide an equivalent eligibility/license gate before processed promotion.

A validation failure throws `DATASET_VALIDATION_FAILED` from the release job, so #1088 does not start R2 publication. #1090 owns revocation/rebuild after previously published data becomes ineligible.
