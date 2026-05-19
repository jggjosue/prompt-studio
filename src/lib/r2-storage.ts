import {
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from '@aws-sdk/client-s3';
import { cacheGet, cacheSet } from '@/lib/server-cache';
import {
  getDemoProjectKind,
  getDemoProjectManifest,
  type DemoProjectKind,
  type DemoProjectManifest,
} from '@/lib/demo-project-type';

const DEFAULT_BUCKET = 'prompt-studio';
const FOLDER_SLUG_RE = /^[a-z0-9][a-z0-9-]*$/i;

let s3Client: S3Client | null = null;

export type R2ProjectValidation = {
  valid: boolean;
  folder: string;
  prefix: string | null;
  projectKind: DemoProjectKind;
  foundFiles: string[];
  missingRequired: string[];
  missingEntry: boolean;
  manifest: DemoProjectManifest;
};

export function getR2BucketName(): string {
  const explicit = process.env.CLOUDFLARE_R2_BUCKET_NAME?.trim();
  if (explicit) return explicit;

  const legacy = process.env.CLOUDFLARE_R2_BUCKET?.trim();
  if (legacy && !legacy.startsWith('http')) return legacy;

  return DEFAULT_BUCKET;
}

export function getR2AccountId(): string | undefined {
  return process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
}

function getR2AccessKeyId(): string | undefined {
  return (
    process.env.R2_ACCESS_KEY_ID?.trim() ||
    process.env.CLOUDFLARE_R2_ACCESS_KEY_ID?.trim()
  );
}

function getR2SecretAccessKey(): string | undefined {
  return (
    process.env.R2_SECRET_ACCESS_KEY?.trim() ||
    process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY?.trim()
  );
}

export function isR2S3Configured(): boolean {
  return Boolean(getR2AccountId() && getR2AccessKeyId() && getR2SecretAccessKey());
}

export function getR2S3Client(): S3Client | null {
  if (!isR2S3Configured()) return null;

  if (!s3Client) {
    const accountId = getR2AccountId()!;
    s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: getR2AccessKeyId()!,
        secretAccessKey: getR2SecretAccessKey()!,
      },
    });
  }

  return s3Client;
}

export function r2PrefixCandidatesForFolder(folderName: string): string[] {
  return [`${folderName}/`, `webpages/${folderName}/`];
}

export async function r2ObjectExists(objectKey: string): Promise<boolean> {
  const client = getR2S3Client();
  if (!client) return false;

  try {
    await client.send(
      new HeadObjectCommand({
        Bucket: getR2BucketName(),
        Key: objectKey,
      })
    );
    return true;
  } catch {
    return false;
  }
}

export async function getR2ObjectText(objectKey: string): Promise<string | null> {
  const bytes = await getR2ObjectBytes(objectKey);
  if (!bytes) return null;
  return bytes.toString('utf8');
}

export async function getR2ObjectBytes(objectKey: string): Promise<Buffer | null> {
  const cached = cacheGet<Buffer>('r2-bytes', objectKey);
  if (cached) return cached;

  const client = getR2S3Client();
  if (!client) return null;

  try {
    const response = await client.send(
      new GetObjectCommand({
        Bucket: getR2BucketName(),
        Key: objectKey,
      })
    );
    if (!response.Body) return null;
    const bytes = Buffer.from(await response.Body.transformToByteArray());
    await cacheSet('r2-bytes', objectKey, bytes, { ttlMs: 6 * 60 * 60 * 1000 });
    return bytes;
  } catch {
    return null;
  }
}

/** Claves posibles para un asset en /webpages/nombre.png */
export function r2AssetKeyCandidates(filename: string): string[] {
  const clean = filename.replace(/^\/+/, '');
  const keys = new Set<string>([clean, `webpages/${clean}`]);
  return [...keys];
}

export async function getR2AssetBytes(filename: string): Promise<Buffer | null> {
  for (const key of r2AssetKeyCandidates(filename)) {
    const bytes = await getR2ObjectBytes(key);
    if (bytes) return bytes;
  }
  return null;
}

async function findPrefixForAnchorFile(
  folderName: string,
  anchorFile: string
): Promise<string | null> {
  const folder = folderName.trim();
  if (!folder || !FOLDER_SLUG_RE.test(folder)) return null;

  for (const prefix of r2PrefixCandidatesForFolder(folder)) {
    if (await r2ObjectExists(`${prefix}${anchorFile}`)) {
      return prefix;
    }
  }

  return null;
}

/** Resuelve prefijo R2 según tipo: HTML → index.html; React/Next → package.json */
export async function resolveR2ProjectPrefix(
  folderName: string,
  projectKind: DemoProjectKind = 'html'
): Promise<string | null> {
  const anchor =
    projectKind === 'html' ? 'index.html' : 'package.json';
  return findPrefixForAnchorFile(folderName, anchor);
}

async function collectExistingFiles(
  prefix: string,
  files: string[]
): Promise<string[]> {
  const found: string[] = [];
  for (const file of files) {
    if (await r2ObjectExists(`${prefix}${file}`)) {
      found.push(file);
    }
  }
  return found;
}

/**
 * Valida carpeta en R2 según stack:
 * - HTML: index.html (+ opcional styles.css, script.js)
 * - React/Next: package.json + al menos un archivo de entrada (app/page.tsx, etc.)
 */
export async function validateR2ProjectFolder(
  folderName: string,
  stack: string[] = []
): Promise<R2ProjectValidation> {
  const folder = folderName.trim();
  const projectKind = getDemoProjectKind(stack);
  const manifest = getDemoProjectManifest(projectKind);

  if (!folder || !FOLDER_SLUG_RE.test(folder)) {
    return {
      valid: false,
      folder,
      prefix: null,
      projectKind,
      foundFiles: [],
      missingRequired: manifest.required,
      missingEntry: manifest.entryAnyOf.length > 0,
      manifest,
    };
  }

  if (!isR2S3Configured()) {
    return {
      valid: false,
      folder,
      prefix: null,
      projectKind,
      foundFiles: [],
      missingRequired: manifest.required,
      missingEntry: manifest.entryAnyOf.length > 0,
      manifest,
    };
  }

  const prefix = await resolveR2ProjectPrefix(folder, projectKind);
  if (!prefix) {
    return {
      valid: false,
      folder,
      prefix: null,
      projectKind,
      foundFiles: [],
      missingRequired: [...manifest.required],
      missingEntry: manifest.entryAnyOf.length > 0,
      manifest,
    };
  }

  const allCandidates = [
    ...manifest.required,
    ...manifest.entryAnyOf,
    ...manifest.optional,
  ];
  const foundFiles = await collectExistingFiles(prefix, allCandidates);

  const missingRequired = manifest.required.filter(
    (file) => !foundFiles.includes(file)
  );

  const hasEntry =
    manifest.entryAnyOf.length === 0 ||
    manifest.entryAnyOf.some((file) => foundFiles.includes(file));

  const valid = missingRequired.length === 0 && hasEntry;

  return {
    valid,
    folder,
    prefix,
    projectKind,
    foundFiles,
    missingRequired,
    missingEntry: !hasEntry,
    manifest,
  };
}

export async function listR2ProjectObjects(prefix: string): Promise<string[]> {
  const client = getR2S3Client();
  if (!client) return [];

  const keys: string[] = [];
  let continuationToken: string | undefined;

  do {
    const page = await client.send(
      new ListObjectsV2Command({
        Bucket: getR2BucketName(),
        Prefix: prefix,
        ContinuationToken: continuationToken,
        MaxKeys: 100,
      })
    );

    for (const item of page.Contents ?? []) {
      if (item.Key) keys.push(item.Key);
    }

    continuationToken = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (continuationToken);

  return keys;
}
