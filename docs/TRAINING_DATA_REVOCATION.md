# Training-data revocation and rebuild

Issue #1090, parent #1072; coordinates with dataset licensing revocation #273. Revocation schema version: 1.

A revocation creates an append-only audit record containing revocation ID, reason, affected source record IDs, timestamp and internal requester identity. It then marks matching pending/eligible TrainingDataRecord entries as revoked. Historical Cloudflare R2 dataset artifacts are never overwritten or edited.

To correct a published dataset, run:
`npm run dataset:rebuild-revoked -- <dataset> <new-version> <superseded-version>`

The rebuild collects current processed examples, excludes any example whose provenance references a revoked source record, deterministically re-splits, generates new manifests/checksums with `revocation-exclusion`, records the superseded version in parent lineage, validates the release, and publishes a new immutable version.

The new version must differ from the superseded version. Consumers should migrate to the corrected version; historical artifacts remain for controlled audit/lineage purposes and must not be selected for new training after supersession.

Revocation audit records contain IDs/reasons only, never prompt bodies, asset bytes or credentials.
