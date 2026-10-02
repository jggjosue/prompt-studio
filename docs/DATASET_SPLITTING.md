# Reproducible dataset splitting

Issue #1086, parent #1072. Split version: `split-v1`.

Default ratios are 90% train, 5% validation and 5% test. Assignment is deterministic: SHA-256 is computed over split version + fixed seed + stable group key, then mapped into the ratio intervals. There is no random runtime state.

Leakage prevention depends on grouping related examples before assignment. Group-key precedence is userGroupId -> sessionId -> requestId -> sourceGroupId -> exampleId. Current dataset schemas intentionally omit direct user IDs, so the shared dataset adapter uses requestId first and source provenance second. This keeps variants from the same generation request together. Builders that have a privacy-safe pseudonymous user/session grouping key should pass it to the lower-level splitter for broader isolation.

Changing ratios alone can move groups, so release manifests must record split version, seed identifier and ratios. Changing grouping semantics or seed requires a new split version/release. Never rebalance individual examples after assignment because that can create leakage.

The adapter emits deterministic `train.jsonl`, `validation.jsonl` and `test.jsonl`. Manifest/checksum recording is handled by #1087.
