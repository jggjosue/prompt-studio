import { createHash } from 'node:crypto';
import type { DatasetName } from '@/lib/dataset-object-contract';
import { DATASET_SPLIT_SEED, DATASET_SPLIT_VERSION, DEFAULT_SPLIT_RATIOS } from '@/lib/dataset-splitting';
import { TRAINING_CANONICALIZATION_VERSION } from '@/lib/training-dedupe';
import { TRAINING_QUALITY_VERSION } from '@/lib/training-quality';
import { TRAINING_SANITIZER_VERSION } from '@/lib/training-sanitizer';
import { SPLIT_GROUP_VERSION, TRAINING_PIPELINE_VERSION } from '@/lib/training/versions';

/**
 * Dataset release manifest.
 *
 * Schema history:
 * - 1: counts, filters, pipeline versions, per-artifact checksums, lineage
 *      (never published: no release ran).
 * - 2: adds buildId, the real source window, per-stage record counts and
 *      per-filter drops, a top-level checksums map, split group strategy,
 *      validation version, revocation snapshot and release job version.
 */
export const DATASET_MANIFEST_SCHEMA_VERSION = 2 as const;

export type DatasetArtifact = { key: string; bytes: number; sha256: string; records: number };

export type DatasetManifestV2 = {
  schemaVersion: typeof DATASET_MANIFEST_SCHEMA_VERSION;
  dataset: DatasetName;
  version: string;
  datasetSchemaVersion: number;
  builtAt: string;
  buildId: string;
  releaseJobVersion: string;
  source: {
    /** Earliest and latest occurredAt of the examples actually released. */
    windowStart: string | null;
    windowEnd: string | null;
    prefixes: string[];
  };
  counts: {
    /** Processed examples found under the source prefixes. */
    candidates: number;
    eligible: number;
    deduplicated: number;
    total: number;
    train: number;
    validation: number;
    test: number;
  };
  filters: Array<{ name: string; dropped: number }>;
  qualityThreshold: number;
  pipeline: {
    pipelineVersion: string;
    sanitizerVersion: string;
    canonicalizationVersion: string;
    qualityVersion: string;
    splitVersion: string;
    splitSeed: string;
    splitRatios: typeof DEFAULT_SPLIT_RATIOS;
    splitGroupVersion: string;
    splitGroupStrategy: 'user-pseudonym';
    validationVersion: string;
  };
  /** sha256 of every artifact except manifest.json and checksums.json (checksums.json covers the manifest). */
  checksums: Record<string, string>;
  artifacts: DatasetArtifact[];
  lineage: {
    parentVersions: string[];
    sourcePrefixes: string[];
    /** sha256 over the sorted source record ids, to compare releases without listing ids. */
    sourceRecordsDigest: string;
    sourceRecordCount: number;
    /** sha256 over the sorted record ids excluded by revocations at build time. */
    revocationSnapshotDigest: string;
    revokedExcluded: number;
    /** Fingerprint of the pseudonymisation secret; group ids are comparable only across equal fingerprints. */
    pseudonymSecretFingerprint: string;
  };
};

export function artifactChecksum(content: string | Uint8Array) {
  return createHash('sha256').update(content).digest('hex');
}

export function sortedDigest(values: Iterable<string>) {
  return artifactChecksum([...new Set(values)].sort().join('\n'));
}

export function buildDatasetManifest(input: Omit<DatasetManifestV2, 'schemaVersion' | 'pipeline'> & { validationVersion: string }): DatasetManifestV2 {
  const { validationVersion, ...rest } = input;
  for (const [name, count] of Object.entries(rest.counts)) {
    if (!Number.isInteger(count) || count < 0) throw new Error(`INVALID_DATASET_RECORD_COUNT:${name}`);
  }
  if (rest.counts.total !== rest.counts.train + rest.counts.validation + rest.counts.test) throw new Error('INVALID_DATASET_RECORD_COUNT:total');
  if (!Number.isFinite(rest.qualityThreshold) || rest.qualityThreshold < 0 || rest.qualityThreshold > 1) throw new Error('INVALID_DATASET_QUALITY_THRESHOLD');
  const artifacts = [...rest.artifacts].sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
  for (const artifact of artifacts) {
    if (!/^[a-f0-9]{64}$/.test(artifact.sha256) || artifact.bytes < 0 || artifact.records < 0) throw new Error('INVALID_DATASET_ARTIFACT');
  }
  for (const value of Object.values(rest.checksums)) if (!/^[a-f0-9]{64}$/.test(value)) throw new Error('INVALID_DATASET_CHECKSUM');
  return {
    schemaVersion: DATASET_MANIFEST_SCHEMA_VERSION,
    ...rest,
    filters: [...rest.filters].sort((a, b) => (a.name < b.name ? -1 : 1)),
    pipeline: {
      pipelineVersion: TRAINING_PIPELINE_VERSION,
      sanitizerVersion: TRAINING_SANITIZER_VERSION,
      canonicalizationVersion: TRAINING_CANONICALIZATION_VERSION,
      qualityVersion: TRAINING_QUALITY_VERSION,
      splitVersion: DATASET_SPLIT_VERSION,
      splitSeed: DATASET_SPLIT_SEED,
      splitRatios: DEFAULT_SPLIT_RATIOS,
      splitGroupVersion: SPLIT_GROUP_VERSION,
      splitGroupStrategy: 'user-pseudonym',
      validationVersion,
    },
    artifacts,
    lineage: {
      ...rest.lineage,
      parentVersions: [...rest.lineage.parentVersions].sort(),
      sourcePrefixes: [...rest.lineage.sourcePrefixes].sort(),
    },
  };
}
