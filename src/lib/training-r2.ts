import 'server-only';
import { HeadBucketCommand, ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';

export const TRAINING_R2_PREFIXES = [
  'raw/',
  'assets/',
  'processed/',
  'datasets/',
  'manifests/',
  'rejected/',
] as const;

export type TrainingR2Config = {
  accountId: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
};

export function getTrainingR2Config(env: NodeJS.ProcessEnv = process.env): TrainingR2Config {
  const accountId = env.CLOUDFLARE_ACCOUNT_ID?.trim() ?? '';
  const bucket = env.CLOUDFLARE_R2_TRAINING_BUCKET?.trim() ?? '';
  const accessKeyId = env.R2_TRAINING_ACCESS_KEY_ID?.trim() ?? '';
  const secretAccessKey = env.R2_TRAINING_SECRET_ACCESS_KEY?.trim() ?? '';
  const missing = [
    !accountId && 'CLOUDFLARE_ACCOUNT_ID',
    !bucket && 'CLOUDFLARE_R2_TRAINING_BUCKET',
    !accessKeyId && 'R2_TRAINING_ACCESS_KEY_ID',
    !secretAccessKey && 'R2_TRAINING_SECRET_ACCESS_KEY',
  ].filter(Boolean);
  if (missing.length) throw new Error(`TRAINING_R2_CONFIG_MISSING:${missing.join(',')}`);
  return { accountId, bucket, accessKeyId, secretAccessKey };
}

export function createTrainingR2Client(config = getTrainingR2Config()) {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

export async function verifyTrainingR2Access() {
  const config = getTrainingR2Config();
  const client = createTrainingR2Client(config);
  await client.send(new HeadBucketCommand({ Bucket: config.bucket }));
  const prefixes: Record<string, boolean> = {};
  for (const prefix of TRAINING_R2_PREFIXES) {
    await client.send(new ListObjectsV2Command({ Bucket: config.bucket, Prefix: prefix, MaxKeys: 1 }));
    prefixes[prefix] = true;
  }
  return { bucket: config.bucket, authenticatedAccessVerified: true, prefixes };
}
