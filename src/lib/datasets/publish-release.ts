import 'server-only';
import { HeadObjectCommand, S3Client } from '@aws-sdk/client-s3';
import type { DatasetName } from '@/lib/dataset-object-contract';
import { datasetReleaseKey } from '@/lib/dataset-object-contract';
import { putImmutableObject } from '@/lib/r2-immutable-object';
import { artifactChecksum } from '@/lib/dataset-manifest';

export const DATASET_RELEASE_JOB_VERSION = 'release-v1';

export type DatasetReleaseFiles = {
  'train.jsonl': string;
  'validation.jsonl': string;
  'test.jsonl': string;
  'manifest.json': string;
  'checksums.json': string;
};

export async function publishImmutableDatasetRelease(input: {
  client: S3Client;
  bucket: string;
  dataset: DatasetName;
  version: string;
  files: DatasetReleaseFiles;
}) {
  const ordered = ['train.jsonl', 'validation.jsonl', 'test.jsonl', 'manifest.json', 'checksums.json'] as const;
  const keys = ordered.map((file) => datasetReleaseKey(input.dataset, input.version, file));
  // Preflight the complete release before the first write to avoid knowingly creating partial versions.
  for (const key of keys) {
    try {
      await input.client.send(new HeadObjectCommand({ Bucket: input.bucket, Key: key }));
      throw new Error(`DATASET_RELEASE_EXISTS:${input.dataset}:${input.version}`);
    } catch (error) {
      const status = (error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode;
      const name = (error as { name?: string }).name;
      if (status !== 404 && name !== 'NotFound' && name !== 'NoSuchKey') throw error;
    }
  }
  for (const file of ordered) {
    await putImmutableObject({
      client: input.client,
      bucket: input.bucket,
      key: datasetReleaseKey(input.dataset, input.version, file),
      body: input.files[file],
      contentType: file.endsWith('.jsonl') ? 'application/x-ndjson' : 'application/json',
      metadata: { releaseJobVersion: DATASET_RELEASE_JOB_VERSION, dataset: input.dataset, version: input.version },
    });
  }
  // Verify exact bytes after upload. A release is successful only if all objects match.
  for (const file of ordered) {
    const key = datasetReleaseKey(input.dataset, input.version, file);
    const head = await input.client.send(new HeadObjectCommand({ Bucket: input.bucket, Key: key }));
    const expectedBytes = Buffer.byteLength(input.files[file], 'utf8');
    if (head.ContentLength !== expectedBytes) throw new Error(`DATASET_RELEASE_VERIFY_FAILED:${key}:bytes`);
    if (head.Metadata?.dataset !== input.dataset || head.Metadata?.version !== input.version) {
      throw new Error(`DATASET_RELEASE_VERIFY_FAILED:${key}:metadata`);
    }
  }
  return {
    dataset: input.dataset,
    version: input.version,
    keys,
    checksums: Object.fromEntries(ordered.map((file) => [file, artifactChecksum(input.files[file])])),
  };
}
