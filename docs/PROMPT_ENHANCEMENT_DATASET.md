# Prompt-enhancement training dataset

Issue #1083, parent #1072. Schema version: 1.

Source is only sanitized/deduplicated intermediate data under `processed/prompt-enhancement/`. Raw MongoDB records and unprocessed prompts are not read by the dataset builder.

Each JSONL row contains `originalIntent`, `improvedPrompt`, modality, quality version/score/threshold and provenance IDs/timestamp. It contains no user ID, email, secrets, binary assets or SQS payloads.

Eligibility rules: the preprocessing pipeline must already have passed consent + sanitization + canonical dedupe; the row must contain a non-empty original/improved pair, the pair must differ, each string is capped at 20k characters, and `quality.passes` must be true.

`exampleId` is SHA-256 over the canonical originalIntent/improvedPrompt/modality tuple. The builder sorts by exampleId and collapses identical IDs, producing deterministic JSONL independent of R2 listing order.

This task defines the dataset examples and JSONL build stage. Train/validation/test assignment is owned by #1086; immutable release manifests/checksums are #1087/#1088.
