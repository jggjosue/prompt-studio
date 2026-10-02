import 'server-only';
import type { DatasetName } from '@/lib/dataset-object-contract';
import { DATASET_NAMES } from '@/lib/dataset-object-contract';
import { collectPromptEnhancementExamples } from '@/lib/datasets/build-prompt-enhancement';
import { collectPreferenceExamples } from '@/lib/datasets/build-preference';
import { collectGenerationExamples } from '@/lib/datasets/build-generation';
import { splitTrainingDataset, serializeDatasetSplits } from '@/lib/datasets/split-dataset';
import { buildManifestFromSplits } from '@/lib/datasets/build-manifest';
import { publishImmutableDatasetRelease } from '@/lib/datasets/publish-release';
import { createTrainingR2Client, getTrainingR2Config } from '@/lib/training-r2';
import { qualityThreshold } from '@/lib/training-quality';

const SCHEMA_VERSIONS: Record<DatasetName, number> = {
  'prompt-enhancement': 1, preference: 1, 'image-generation': 1, 'video-generation': 1, 'web-generation': 1,
};

export async function runDatasetRelease(input: { dataset: DatasetName; version: string; builtAt?: string }) {
  if (!DATASET_NAMES.includes(input.dataset)) throw new Error('INVALID_DATASET_NAME');
  const config = getTrainingR2Config();
  const client = createTrainingR2Client(config);
  const collected = input.dataset === 'prompt-enhancement'
    ? await collectPromptEnhancementExamples({ client, bucket: config.bucket })
    : input.dataset === 'preference'
      ? await collectPreferenceExamples({ client, bucket: config.bucket })
      : await collectGenerationExamples({ client, bucket: config.bucket, modality: input.dataset.replace('-generation', '') as 'image' | 'video' | 'web' });
  const splits = splitTrainingDataset(collected.examples);
  const files = serializeDatasetSplits(splits);
  const prefix = `processed/${input.dataset}/`;
  const built = buildManifestFromSplits({
    dataset: input.dataset,
    version: input.version,
    datasetSchemaVersion: SCHEMA_VERSIONS[input.dataset],
    builtAt: input.builtAt ?? new Date().toISOString(),
    source: { windowStart: null, windowEnd: null, query: prefix },
    filters: ['consent', 'sanitizer-pass', 'canonical-dedupe', 'quality-pass'],
    qualityThreshold: qualityThreshold(input.dataset),
    lineage: { parentVersions: [], sourcePrefixes: [prefix] },
    files,
  });
  return publishImmutableDatasetRelease({
    client,
    bucket: config.bucket,
    dataset: input.dataset,
    version: input.version,
    files: { ...files, 'manifest.json': built['manifest.json'], 'checksums.json': built['checksums.json'] },
  });
}
