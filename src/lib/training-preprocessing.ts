import 'server-only';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import type { ITrainingDataRecord } from '@/models/TrainingDataRecord';
import { processedKey, type DatasetName } from '@/lib/dataset-object-contract';

export const TRAINING_PIPELINE_VERSION = 'pipeline-v1';

export function targetDatasetForRecord(record: Pick<ITrainingDataRecord, 'entityType' | 'modality'>): DatasetName {
  if (record.entityType === 'feedback' || record.entityType === 'edit') return 'preference';
  if (record.modality === 'image') return 'image-generation';
  if (record.modality === 'video') return 'video-generation';
  if (record.modality === 'web' || record.modality === 'project') return 'web-generation';
  return 'prompt-enhancement';
}

export function normalizeTrainingRecord(record: ITrainingDataRecord) {
  if (!record.consent?.training || !['pending', 'eligible'].includes(record.eligibility?.status)) {
    throw new Error('TRAINING_RECORD_NOT_ELIGIBLE_FOR_PROCESSING');
  }
  return {
    schemaVersion: 1,
    recordId: record.recordId,
    entityType: record.entityType,
    modality: record.modality,
    model: record.model,
    parameters: record.parameters ?? {},
    payload: record.payload ?? {},
    assets: (record.assets ?? []).map((asset) => ({
      provider: asset.provider,
      bucket: asset.bucket,
      key: asset.key,
      contentType: asset.contentType,
      contentHash: asset.contentHash,
      bytes: asset.bytes,
    })),
    provenance: record.provenance,
    occurredAt: record.occurredAt.toISOString(),
  };
}

export async function verifyReferencedR2Assets(input: {
  client: S3Client;
  assets: ReturnType<typeof normalizeTrainingRecord>['assets'];
}) {
  for (const asset of input.assets) {
    if (asset.provider !== 'cloudflare-r2') continue;
    if (!asset.bucket) throw new Error('TRAINING_ASSET_BUCKET_MISSING');
    const response = await input.client.send(new GetObjectCommand({
      Bucket: asset.bucket,
      Key: asset.key,
      Range: 'bytes=0-0',
    }));
    if (!response.Body) throw new Error(`TRAINING_ASSET_UNAVAILABLE:${asset.key}`);
  }
}

export async function writeProcessedTrainingRecord(input: {
  client: S3Client;
  bucket: string;
  record: ITrainingDataRecord;
}) {
  const normalized = normalizeTrainingRecord(input.record);
  const dataset = targetDatasetForRecord(input.record);
  const key = processedKey({ dataset, pipelineVersion: TRAINING_PIPELINE_VERSION, recordId: input.record.recordId });
  const body = JSON.stringify(normalized);
  await input.client.send(new PutObjectCommand({
    Bucket: input.bucket,
    Key: key,
    Body: body,
    ContentType: 'application/json',
    Metadata: {
      schemaVersion: '1',
      pipelineVersion: TRAINING_PIPELINE_VERSION,
      sourceRecordId: input.record.recordId,
    },
  }));
  return { dataset, key, bytes: Buffer.byteLength(body, 'utf8') };
}
