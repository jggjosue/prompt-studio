/**
 * Versions stamped on every processed example and dataset manifest. Pure module
 * (no server imports) so manifests, tests and CLIs can read it anywhere.
 * Bump a version whenever the behaviour it names changes output.
 */
export const TRAINING_PIPELINE_VERSION = 'pipeline-v2';
export const PROCESSED_EXAMPLE_SCHEMA_VERSION = 2 as const;
export const SPLIT_GROUP_VERSION = 'split-group-v1';
