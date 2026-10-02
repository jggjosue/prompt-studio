import 'server-only';
import type { DatasetName } from '@/lib/dataset-object-contract';
import { TrainingDataRevocation } from '@/models/TrainingDataRevocation';
import { collectPromptEnhancementExamples } from '@/lib/datasets/build-prompt-enhancement';
import { collectPreferenceExamples } from '@/lib/datasets/build-preference';
import { collectGenerationExamples } from '@/lib/datasets/build-generation';
import { excludeRevokedExamples } from '@/lib/training-revocation';
import { splitTrainingDataset, serializeDatasetSplits } from '@/lib/datasets/split-dataset';
import { buildManifestFromSplits } from '@/lib/datasets/build-manifest';
import { assertValidDatasetRelease } from '@/lib/dataset-validation';
import { publishImmutableDatasetRelease } from '@/lib/datasets/publish-release';
import { createTrainingR2Client, getTrainingR2Config } from '@/lib/training-r2';
import { qualityThreshold } from '@/lib/training-quality';

export async function rebuildDatasetAfterRevocation(input: {
  dataset: DatasetName;
  version: string;
  supersedes: string;
  builtAt?: string;
}) {
  if (input.version === input.supersedes) throw new Error('REVOCATION_REBUILD_REQUIRES_NEW_VERSION');
  const config = getTrainingR2Config();
  const client = createTrainingR2Client(config);
  const collected = input.dataset === 'prompt-enhancement'
    ? await collectPromptEnhancementExamples({ client, bucket: config.bucket })
    : input.dataset === 'preference'
      ? await collectPreferenceExamples({ client, bucket: config.bucket })
      : await collectGenerationExamples({ client, bucket: config.bucket, modality: input.dataset.replace('-generation', '') as 'image'|'video'|'web' });
  const revocations = await TrainingDataRevocation.find({}, { sourceRecordIds: 1, _id: 0 }).lean();
  const revokedIds = revocations.flatMap((r: any) => r.sourceRecordIds ?? []);
  const examples = excludeRevokedExamples(collected.examples, revokedIds);
  const splitFiles = serializeDatasetSplits(splitTrainingDataset(examples));
  const prefix = `processed/${input.dataset}/`;
  const built = buildManifestFromSplits({
    dataset: input.dataset,
    version: input.version,
    datasetSchemaVersion: 1,
    builtAt: input.builtAt ?? new Date().toISOString(),
    source: { windowStart: null, windowEnd: null, query: prefix },
    filters: ['consent', 'sanitizer-pass', 'canonical-dedupe', 'quality-pass', 'revocation-exclusion'],
    qualityThreshold: qualityThreshold(input.dataset),
    lineage: { parentVersions: [input.supersedes], sourcePrefixes: [prefix] },
    files: splitFiles,
  });
  const files = { ...splitFiles, 'manifest.json': built['manifest.json'], 'checksums.json': built['checksums.json'] };
  assertValidDatasetRelease({ files });
  const published = await publishImmutableDatasetRelease({ client, bucket: config.bucket, dataset: input.dataset, version: input.version, files });
  return { ...published, supersedes: input.supersedes, revokedSourceRecords: new Set(revokedIds).size };
}
