import { artifactChecksum, buildDatasetManifest, type DatasetArtifact, type DatasetManifestV1 } from '@/lib/dataset-manifest';
import type { DatasetName } from '@/lib/dataset-object-contract';

function recordCount(jsonl: string) {
  if (!jsonl) return 0;
  return jsonl.split('\n').filter(Boolean).length;
}

export function buildManifestFromSplits(input: {
  dataset: DatasetName;
  version: string;
  datasetSchemaVersion: number;
  builtAt: string;
  source: DatasetManifestV1['source'];
  filters: string[];
  qualityThreshold: number;
  lineage: DatasetManifestV1['lineage'];
  files: { 'train.jsonl': string; 'validation.jsonl': string; 'test.jsonl': string };
}) {
  const artifacts: DatasetArtifact[] = Object.entries(input.files).map(([key, content]) => ({
    key,
    bytes: Buffer.byteLength(content, 'utf8'),
    sha256: artifactChecksum(content),
    records: recordCount(content),
  }));
  const counts = {
    train: artifacts.find((a) => a.key === 'train.jsonl')!.records,
    validation: artifacts.find((a) => a.key === 'validation.jsonl')!.records,
    test: artifacts.find((a) => a.key === 'test.jsonl')!.records,
  };
  const manifest = buildDatasetManifest({ ...input, artifacts, counts });
  const manifestJson = JSON.stringify(manifest, null, 2) + '\n';
  const checksums = Object.fromEntries([
    ...artifacts.map((artifact) => [artifact.key, artifact.sha256] as const),
    ['manifest.json', artifactChecksum(manifestJson)] as const,
  ]);
  return {
    manifest,
    'manifest.json': manifestJson,
    'checksums.json': JSON.stringify(checksums, null, 2) + '\n',
  };
}
