import 'server-only';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import type { TrainingRejectionReason } from '@/lib/training-sanitizer';

export async function writeTrainingRejection(input: {
  client: S3Client;
  bucket: string;
  recordId: string;
  entityType: string;
  reasonCodes: TrainingRejectionReason[];
  sanitizerVersion: string;
  occurredAt?: Date;
}) {
  const date = input.occurredAt ?? new Date();
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const key = `rejected/${yyyy}/${mm}/${dd}/${input.entityType}/${input.recordId}.json`;
  const body = JSON.stringify({
    schemaVersion: 1,
    recordId: input.recordId,
    entityType: input.entityType,
    reasonCodes: [...new Set(input.reasonCodes)].sort(),
    sanitizerVersion: input.sanitizerVersion,
    rejectedAt: date.toISOString(),
  });
  await input.client.send(new PutObjectCommand({
    Bucket: input.bucket,
    Key: key,
    Body: body,
    ContentType: 'application/json',
    Metadata: { rejected: 'true', sanitizerVersion: input.sanitizerVersion },
  }));
  return { key, bytes: Buffer.byteLength(body, 'utf8') };
}
