# Training preprocessing worker

Issue #1079, parent #1072.

Run with `npm run worker:training`. The worker consumes `AWS_TRAINING_SQS_QUEUE_URL`, parses the v1 compact contract, loads the canonical `TrainingDataRecord` from MongoDB, re-checks consent/eligibility, verifies referenced R2 assets and writes normalized JSON to `processed/{dataset}/pipeline-v1/{recordId}.json`.

The SQS body never contains prompts or asset bytes. R2 assets remain references. A record that is unconsented, ineligible or revoked at processing time is acknowledged without producing processed data.

Processing is safe to retry because the processed key is deterministic for `dataset + pipelineVersion + recordId`; a retry replaces the same intermediate object rather than creating duplicates. Immutable semantics begin at versioned `datasets/{dataset}/vNNNNNN/` releases, not the mutable/rebuildable `processed/` staging area.

Temporary transport/R2/Mongo failures leave the message for SQS retry/DLQ. Permanent policy failures are acknowledged. #1080 adds PII/secrets rejection and reason codes; #1081 adds content-hash deduplication.
