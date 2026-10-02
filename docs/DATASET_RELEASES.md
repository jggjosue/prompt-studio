# Dataset release command

Issue #1088, parent #1072. Job version: `release-v1`.

Run internally with:
`npm run dataset:release -- <dataset> <v000001>`

The command requires the private training R2 environment variables and never accepts credentials as CLI arguments. Supported datasets are prompt-enhancement, preference, image-generation, video-generation and web-generation.

Flow: collect sanitized/quality-gated processed examples → deterministic split → train/validation/test JSONL → manifest/checksums → preflight immutable R2 keys → upload → verify all objects. Release paths are `datasets/{dataset}/{version}/`.

Publication fails if any target object already exists. It also fails if post-upload Content-Length or release metadata does not match. The CLI prints only dataset/version/keys on success and never secrets.

A failed upload can leave an incomplete version prefix; because immutable publication will refuse reuse, operators must treat that version as failed and choose a new version after investigation. It must not be considered published unless the command returns success. #1089 adds deeper content/leakage validation before promotion.
