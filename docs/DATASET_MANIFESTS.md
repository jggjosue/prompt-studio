# Dataset manifests, checksums and lineage

Issue #1087, parent #1072. Manifest schema version: 1.

Every immutable dataset release must include `manifest.json` and `checksums.json` beside train/validation/test JSONL files.

The manifest records dataset/version/schema, UTC build timestamp, source window/query, split and total record counts, sorted filters, quality threshold, pipeline/sanitizer/canonicalization/quality/split versions, split seed/ratios, artifact bytes/records/SHA-256, parent versions and source prefixes.

`checksums.json` contains SHA-256 for each JSONL artifact and for the exact bytes of `manifest.json`. Artifact lists, filters and lineage arrays are sorted before serialization where ordering is not semantically meaningful, supporting reproducible metadata.

Manifests must never contain credentials, raw secrets, direct user identifiers or binary payloads. Source queries should describe reproducible dataset selection, not embed sensitive source records.

#1088 owns immutable publication to Cloudflare R2 and must refuse to overwrite an existing release version. #1089 will validate release contents and leakage before promotion.
