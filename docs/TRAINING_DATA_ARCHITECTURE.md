# Training-data architecture and operations

Parent epic: #1072. This document is the operational index for Prompt Studio training data.

## Architecture

```text
/generate
  -> privacy-aware training events
  -> MongoDB training_data_records + append-only consent/revocation records
  -> Amazon SQS (IDs/metadata only)
  -> aws-training-data-worker
  -> consent/eligibility gate
  -> R2 asset verification
  -> sanitizer / rejection
  -> canonical dedupe
  -> quality signals
  -> Cloudflare R2 processed/{dataset}/...
  -> dataset builder
  -> deterministic grouped split
  -> manifest + checksums
  -> validation/leakage gate
  -> immutable R2 datasets/{dataset}/{version}/
  -> training run pins exact dataset + version + checksums
```

MongoDB stores operational records and lineage IDs, not large binary assets. SQS messages carry IDs and small metadata, never prompt/asset bodies. Cloudflare R2 is the canonical store for private training assets, processed examples and immutable releases.

## Contracts and collections

- `training_data_records`: versioned training-data envelopes, consent snapshot, eligibility, provenance and R2 references.
- `training_consent_records`: append-only policy-versioned consent decisions.
- `training_content_fingerprints`: canonical content hashes and duplicate lineage.
- `training_data_revocations`: append-only revocation audit records.
- Event taxonomy: prompt_submitted, generation_started/completed/failed, output_viewed/saved/downloaded, regenerate_clicked, prompt_edited, feedback_positive/negative, added_to_queue.
- SQS contract: versioned process-record/build-dataset messages containing identifiers only.

## R2 layout

```text
raw/YYYY/MM/DD/generations/
assets/images|videos|audio/
processed/{dataset}/{pipeline-version}/
rejected/YYYY/MM/DD/{entity-type}/
datasets/{dataset}/{v000001}/
  train.jsonl
  validation.jsonl
  test.jsonl
  manifest.json
  checksums.json
```

Dataset names: prompt-enhancement, preference, image-generation, video-generation, web-generation.

## Privacy and eligibility

Training requires an explicit current training-consent policy decision. Revoked, stale, absent or false consent is ineligible. Sanitization detects common secrets/high-risk fields and redacts supported PII patterns before processed storage. Rejected records receive reason metadata without sensitive values. Binary outputs remain R2 references.

## Build and release

Normal release:
`npm run dataset:release -- <dataset> <v000001>`

Flow: collect processed examples -> quality filter -> deterministic 90/5/5 grouped split -> manifest/checksums -> validation/leakage gate -> immutable R2 upload -> post-upload verification.

Never reuse or overwrite a release version. A failed partial version is abandoned and a new version number is used after investigation.

## Training pinning

A training job must record the exact dataset name and immutable version, for example `prompt-enhancement@v000014`, plus the release `manifest.json` and `checksums.json` SHA-256 values. Never train from `latest`, a mutable prefix, or directly from `processed/`. Before training, verify checksums and confirm the selected release is not superseded by a revocation rebuild.

## Revocation and corrected rebuild

Create a revocation audit record and mark affected source records revoked. Rebuild with:
`npm run dataset:rebuild-revoked -- <dataset> <new-version> <superseded-version>`

The corrected release excludes any example whose provenance references revoked source records and records the superseded version in manifest lineage. Historical releases remain immutable but must not be selected for new training.

## Recovery and DLQ

Worker failures leave SQS messages undeleted for retry; repeated failures move according to the queue redrive/DLQ policy. A non-empty DLQ is a critical alert. Investigate the error class without logging prompt/user/asset content, fix the underlying issue, then redrive only messages that remain eligible. Revoked/ineligible records should be acknowledged/dropped rather than reprocessed.

For a stalled queue, inspect queue depth, worker health, credentials/network access and processing latency. Do not bypass sanitizer, consent, dedupe or validation gates to drain backlog.

## Observability

Use `observability-v1`: throughput, rejection/duplicate/failure counts, processing/release duration, queue/DLQ depth, examples per dataset and R2 bytes/operations. Labels must remain low-cardinality and must not contain prompts, user IDs, record IDs, object keys, queue URLs or secrets.

## Detailed runbooks

- `docs/training-r2.md`
- `docs/TRAINING_PREPROCESSING_WORKER.md`
- `docs/TRAINING_DATA_SANITIZATION.md`
- `docs/TRAINING_DATA_DEDUPLICATION.md`
- `docs/PROMPT_ENHANCEMENT_DATASET.md`
- `docs/PREFERENCE_DATASET.md`
- `docs/GENERATION_DATASETS.md`
- `docs/DATASET_SPLITTING.md`
- `docs/DATASET_MANIFESTS.md`
- `docs/DATASET_RELEASES.md`
- `docs/DATASET_VALIDATION.md`
- `docs/TRAINING_DATA_REVOCATION.md`
- `docs/DATASET_OBSERVABILITY.md`

## Operator checklist

Before release: confirm R2 authenticated access, worker health, consent gate, no unresolved DLQ incident, expected quality threshold and target version unused. After build: validation must pass, checksums/counts must match, release upload verification must succeed. Before training: pin exact version/checksums and confirm it is not superseded. After revocation: stop selecting affected releases and publish a corrected version.
