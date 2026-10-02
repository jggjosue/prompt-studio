# Training R2 object conventions

All keys are deterministic and lowercase. Dataset releases are immutable.

## Canonical layouts

```text
raw/YYYY/MM/DD/generations/{sha-prefix}/{recordId}.json
assets/images/sha256/{sha-prefix}/{sha256}.{ext}
assets/videos/sha256/{sha-prefix}/{sha256}.{ext}
assets/audio/sha256/{sha-prefix}/{sha256}.{ext}
processed/{dataset}/{pipelineVersion}/{recordId}.json
datasets/{dataset}/v000001/
  train.jsonl
  validation.jsonl
  test.jsonl
  manifest.json
  checksums.json
  DATASET_CARD.md
  LICENSES.json
manifests/
rejected/
```

Dataset versions are monotonic six-digit identifiers (`v000001`, `v000002`, ...). A released key is never overwritten. Corrections and consent revocations produce a new version and preserve lineage to the superseded release.

Large binaries are addressed by SHA-256 and live only under `assets/`. MongoDB and SQS contain references/IDs, never binary payloads.

`manifest.json` schema v1 records dataset/version, build ID, UTC build time, source window, pipeline version, split counts, checksums and source lineage. Splits are files, not mutable labels on R2 objects.

Application code must use `putImmutableObject` for release objects. Existing keys fail closed with `IMMUTABLE_OBJECT_EXISTS`.
