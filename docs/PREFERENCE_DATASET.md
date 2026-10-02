# Preference training dataset

Issue #1084, parent #1072. Schema version: 1.

The preference builder consumes only sanitized/deduplicated records under `processed/preference/`. A pair requires a shared request context, distinct chosen/rejected output IDs, at least one evidence event ID, provenance records, and `quality.passes=true`.

Accepted evidence v1:
- `explicit_positive_vs_negative`: explicit positive signal for chosen paired with explicit negative signal for rejected.
- `selected_after_regenerate`: after regeneration, the user explicitly selects a candidate.
- `saved_after_regenerate`: after regeneration, the user saves one candidate.
- `downloaded_after_regenerate`: after regeneration, the user downloads one candidate.

Mere `output_viewed`, generation success, model score, latency, cost or quality-score differences do not establish a preference. The builder never invents chosen/rejected from those signals.

Rows contain prompt/context plus output references/model IDs, not image/video/audio bytes. `exampleId` is deterministic from request/context/chosen/rejected/signal type; event IDs and source record IDs preserve signal lineage.

Train/validation/test grouping is handled by #1086. Release manifests/checksums and immutable publication are #1087/#1088.
