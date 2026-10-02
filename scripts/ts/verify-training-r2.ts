import { HeadBucketCommand, ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';

const required = ['CLOUDFLARE_ACCOUNT_ID', 'CLOUDFLARE_R2_TRAINING_BUCKET', 'R2_TRAINING_ACCESS_KEY_ID', 'R2_TRAINING_SECRET_ACCESS_KEY'];
const missing = required.filter((name) => !process.env[name]?.trim());
if (missing.length) {
  console.error(JSON.stringify({ ok: false, code: 'TRAINING_R2_CONFIG_MISSING', variables: missing }));
  process.exit(1);
}
const bucket = process.env.CLOUDFLARE_R2_TRAINING_BUCKET!;
const client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: process.env.R2_TRAINING_ACCESS_KEY_ID!, secretAccessKey: process.env.R2_TRAINING_SECRET_ACCESS_KEY! },
});
await client.send(new HeadBucketCommand({ Bucket: bucket }));
const prefixes: Record<string, boolean> = {};
for (const prefix of ['raw/', 'assets/', 'processed/', 'datasets/', 'manifests/', 'rejected/']) {
  await client.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix, MaxKeys: 1 }));
  prefixes[prefix] = true;
}
console.log(JSON.stringify({
  ok: true,
  bucket,
  endpoint: 'r2-s3',
  authenticatedAccessVerified: true,
  prefixes,
  publicAccessVerified: false,
  publicAccessVerificationRequired: true,
  note: 'S3-compatible authenticated calls cannot prove that r2.dev/custom-domain public access is disabled; verify that control in Cloudflare account configuration.',
}, null, 2));
