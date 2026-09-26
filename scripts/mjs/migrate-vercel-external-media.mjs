import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config({ path: process.env.ENV_FILE || '.env.local' });

const root = process.cwd();
const manifest = JSON.parse(
  await readFile(path.join(root, 'config/vercel-external-media.json'), 'utf8')
);
const shouldUpload = process.argv.includes('--upload');
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
const bucket = process.env.CLOUDFLARE_R2_BUCKET_NAME?.trim();
const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();

if (!accountId || !bucket || !accessKeyId || !secretAccessKey) {
  throw new Error('Faltan credenciales R2 para verificar la migración');
}

const client = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId, secretAccessKey },
});

for (const object of manifest.objects) {
  if (shouldUpload) {
    const source = path.join(root, 'public', object.path);
    const body = await readFile(source);
    const digest = createHash('sha256').update(body).digest('hex');
    if (body.byteLength !== object.bytes || digest !== object.sha256) {
      throw new Error(`El archivo local no coincide con el manifiesto: ${object.path}`);
    }
    await client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: object.path,
      Body: body,
      ContentType: 'video/mp4',
      CacheControl: 'public, max-age=31536000, immutable',
      Metadata: { sha256: digest },
    }));
  }

  const head = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: object.path }));
  const remoteSize = Number(head.ContentLength ?? -1);
  const remoteHash = head.Metadata?.sha256;
  if (remoteSize !== object.bytes || remoteHash !== object.sha256) {
    throw new Error(`R2 no coincide con el manifiesto: ${object.path}`);
  }
  console.log(`${shouldUpload ? 'uploaded' : 'verified'} ${object.bytes} ${object.path}`);
}

console.log(`${manifest.objects.length} objetos verificados en R2`);
