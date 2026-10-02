# Image, video and web generation datasets

Issue #1085, parent #1072. Shared schema version: 1.

Builders consume only sanitized/deduplicated/quality-scored staging objects:
- `processed/image-generation/`
- `processed/video-generation/`
- `processed/web-generation/`

Each JSONL row contains prompt, modality, model snapshot, extensible provider/model parameters, quality metadata, provenance and R2 output references. Binary image/video payloads are never embedded in JSONL.

Image assets must use image/* content types; video assets video/*; web artifacts accept text/html, text/plain, application/json or application/xhtml+xml. A missing prompt, no compatible R2 output, modality mismatch or failed quality gate excludes the row.

`exampleId` is deterministic from modality + prompt + model + parameters + sorted output hashes/keys. Builders sort and deduplicate by exampleId so output is reproducible independent of R2 listing order.

This schema deliberately keeps provider/model parameters as a versioned extensibility point. Schema-breaking interpretation changes require a new dataset schema version. Splitting is #1086; manifests/checksums and immutable release publication are #1087/#1088.
