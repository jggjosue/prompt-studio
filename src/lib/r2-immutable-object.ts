import 'server-only';
import { HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

export async function putImmutableObject(input: {
  client: S3Client;
  bucket: string;
  key: string;
  body: string | Uint8Array;
  contentType: string;
  metadata?: Record<string, string>;
}) {
  try {
    await input.client.send(new HeadObjectCommand({ Bucket: input.bucket, Key: input.key }));
    throw new Error(`IMMUTABLE_OBJECT_EXISTS:${input.key}`);
  } catch (error) {
    const status = (error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode;
    const name = (error as { name?: string }).name;
    if (status !== 404 && name !== 'NotFound' && name !== 'NoSuchKey') throw error;
  }
  await input.client.send(new PutObjectCommand({
    Bucket: input.bucket,
    Key: input.key,
    Body: input.body,
    ContentType: input.contentType,
    Metadata: { immutable: 'true', ...(input.metadata ?? {}) },
  }));
}
