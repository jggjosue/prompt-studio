import { createHash } from 'node:crypto';
import type { DatasetName } from '@/lib/dataset-object-contract';
import { DATASET_SPLIT_SEED, DATASET_SPLIT_VERSION, DEFAULT_SPLIT_RATIOS } from '@/lib/dataset-splitting';
import { TRAINING_CANONICALIZATION_VERSION } from '@/lib/training-dedupe';
import { TRAINING_QUALITY_VERSION } from '@/lib/training-quality';
import { TRAINING_SANITIZER_VERSION } from '@/lib/training-sanitizer';
import { TRAINING_PIPELINE_VERSION } from '@/lib/training-preprocessing';

export const DATASET_MANIFEST_SCHEMA_VERSION = 1 as const;

export type DatasetArtifact = {
  key: string;
  bytes: number;
  sha256: string;
  records: number;
};

export type DatasetManifestV1 = {
  schemaVersion: typeof DATASET_MANIFEST_SCHEMA_VERSION;
  dataset: DatasetName;
  version: string;
  datasetSchemaVersion: number;
  builtAt: string;
  source: { windowStart: string | null; windowEnd: string | null; query: string };
  counts: { total: number; train: number; validation: number; test: number };
  filters: string[];
  qualityThreshold: number;
  pipeline: {
    pipelineVersion: string;
    sanitizerVersion: string;
    canonicalizationVersion: string;
    qualityVersion: string;
    splitVersion: string;
    splitSeed: string;
    splitRatios: typeof DEFAULT_SPLIT_RATIOS;
  };
  artifacts: DatasetArtifact[];
  lineage: { parentVersions: string[]; sourcePrefixes: string[] };
};

export function artifactChecksum(content: string | Uint8Array) {
  return createHash('sha256').update(content).digest('hex');
}

export function buildDatasetManifest(input: Omit<DatasetManifestV1, 'schemaVersion' | 'pipeline' | 'counts'> & {
  counts: { train: number; validation: number; test: number };
}): DatasetManifestV1 {
  for (const count of Object.values(input.counts)) if (!Number.isInteger(count) || count < 0) throw new Error('INVALID_DATASET_RECORD_COUNT');
  if (!Number.isFinite(input.qualityThreshold) || input.qualityThreshold < 0 || input.qualityThreshold > 1) throw new Error('INVALID_DATASET_QUALITY_THRESHOLD');
  const artifacts = [...input.artifacts].sort((a, b) => a.key.localeCompare(b.key));
  for (const artifact of artifacts) {
    if (!/^[a-f0-9]{64}$/.test(artifact.sha256) || artifact.bytes < 0 || artifact.records < 0) throw new Error('INVALID_DATASET_ARTIFACT');
  }
  const counts = { total: input.counts.train + input.counts.validation + input.counts.test, ...input.counts };
  return {
    schemaVersion: DATASET_MANIFEST_SCHEMA_VERSION,
    dataset: input.dataset,
    version: input.version,
    datasetSchemaVersion: input.datasetSchemaVersion,
    builtAt: input.builtAt,
    source: input.source,
    counts,
    filters: [...input.filters].sort(),
    qualityThreshold: input.qualityThreshold,
    pipeline: {
      pipelineVersion: TRAINING_PIPELINE_VERSION,
      sanitizerVersion: TRAINING_SANITIZER_VERSION,
      canonicalizationVersion: TRAINING_CANONICALIZATION_VERSION,
      qualityVersion: TRAINING_QUALITY_VERSION,
      splitVersion: DATASET_SPLIT_VERSION,
      splitSeed: DATASET_SPLIT_SEED,
      splitRatios: DEFAULT_SPLIT_RATIOS,
    },
    artifacts,
    lineage: {
      parentVersions: [...input.lineage.parentVersions].sort(),
      sourcePrefixes: [...input.lineage.sourcePrefixes].sort(),
    },
  };
}
