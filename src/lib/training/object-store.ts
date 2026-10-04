import 'server-only';
import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createTrainingR2Client, getTrainingR2Config } from '@/lib/training-r2';
import { emitTrainingMetric } from '@/lib/training/training-metrics';

/**
 * Storage for the private training bucket (Cloudflare R2 in production).
 *
 * `put(..., { ifNoneMatch: true })` is an atomic create: R2 rejects it with
 * 412 when the key exists (conditional PutObject, see R2 S3 API extensions),
 * which is what makes dataset releases and raw evidence immutable without a
 * check-then-write race.
 */
export type PutOptions = { contentType: string; ifNoneMatch?: boolean; metadata?: Record<string, string> };
export type HeadResult = { bytes: number; contentType: string | null; metadata: Record<string, string>; etag: string | null };

export interface TrainingObjectStore {
  readonly bucket: string;
  /** Returns created=false (instead of throwing) when ifNoneMatch is set and the key exists. */
  put(key: string, body: string | Uint8Array, options: PutOptions): Promise<{ created: boolean }>;
  get(key: string): Promise<Uint8Array | null>;
  head(key: string): Promise<HeadResult | null>;
  /** All keys under a prefix, sorted. */
  list(prefix: string): Promise<string[]>;
  delete(key: string): Promise<void>;
  /** Short-lived GET URL; never makes the object public. */
  signedGetUrl(key: string, expiresInSeconds: number): Promise<string>;
}

export const sha256Hex = (value: string | Uint8Array) => createHash('sha256').update(value).digest('hex');
const bytesOf = (body: string | Uint8Array) => (typeof body === 'string' ? new TextEncoder().encode(body) : body);
export const textOf = (bytes: Uint8Array) => new TextDecoder().decode(bytes);

function isPreconditionFailed(error: unknown) {
  const value = error as { name?: string; $metadata?: { httpStatusCode?: number }; Code?: string };
  return value?.$metadata?.httpStatusCode === 412 || value?.name === 'PreconditionFailed' || value?.Code === 'PreconditionFailed';
}

function isNotFound(error: unknown) {
  const value = error as { name?: string; $metadata?: { httpStatusCode?: number } };
  return value?.$metadata?.httpStatusCode === 404 || value?.name === 'NoSuchKey' || value?.name === 'NotFound';
}

export class R2TrainingObjectStore implements TrainingObjectStore {
  constructor(private readonly client: S3Client, readonly bucket: string) {}

  async put(key: string, body: string | Uint8Array, options: PutOptions) {
    const bytes = bytesOf(body);
    try {
      await this.client.send(new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: bytes,
        ContentType: options.contentType,
        Metadata: options.metadata,
        ...(options.ifNoneMatch ? { IfNoneMatch: '*' } : {}),
      }));
    } catch (error) {
      emitTrainingMetric('training_r2_operations_total', 1, { operation: 'put', result: 'failure' });
      if (options.ifNoneMatch && isPreconditionFailed(error)) return { created: false };
      throw error;
    }
    emitTrainingMetric('training_r2_operations_total', 1, { operation: 'put', result: 'success' });
    emitTrainingMetric('training_r2_bytes_written_total', bytes.byteLength);
    return { created: true };
  }

  async get(key: string) {
    try {
      const response = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));
      emitTrainingMetric('training_r2_operations_total', 1, { operation: 'get', result: 'success' });
      return response.Body ? new Uint8Array(await response.Body.transformToByteArray()) : null;
    } catch (error) {
      if (isNotFound(error)) return null;
      emitTrainingMetric('training_r2_operations_total', 1, { operation: 'get', result: 'failure' });
      throw error;
    }
  }

  async head(key: string) {
    try {
      const response = await this.client.send(new HeadObjectCommand({ Bucket: this.bucket, Key: key }));
      emitTrainingMetric('training_r2_operations_total', 1, { operation: 'head', result: 'success' });
      return { bytes: response.ContentLength ?? 0, contentType: response.ContentType ?? null, metadata: response.Metadata ?? {}, etag: response.ETag ?? null };
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }
  }

  async list(prefix: string) {
    const keys: string[] = [];
    let token: string | undefined;
    do {
      const page = await this.client.send(new ListObjectsV2Command({ Bucket: this.bucket, Prefix: prefix, ContinuationToken: token }));
      emitTrainingMetric('training_r2_operations_total', 1, { operation: 'list', result: 'success' });
      for (const object of page.Contents ?? []) if (object.Key) keys.push(object.Key);
      token = page.IsTruncated ? page.NextContinuationToken : undefined;
    } while (token);
    return keys.sort();
  }

  async delete(key: string) {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
    emitTrainingMetric('training_r2_operations_total', 1, { operation: 'delete', result: 'success' });
  }

  signedGetUrl(key: string, expiresInSeconds: number) {
    return getSignedUrl(this.client, new GetObjectCommand({ Bucket: this.bucket, Key: key }), { expiresIn: expiresInSeconds });
  }
}

/** In-memory store with the same conditional-write semantics (tests). */
export class MemoryTrainingObjectStore implements TrainingObjectStore {
  readonly objects = new Map<string, { bytes: Uint8Array; contentType: string; metadata: Record<string, string> }>();
  /** Keys whose next put should fail, to simulate partial uploads. */
  readonly failPutsFor = new Set<string>();
  constructor(readonly bucket = 'memory-training-bucket') {}

  async put(key: string, body: string | Uint8Array, options: PutOptions) {
    if (this.failPutsFor.has(key)) {
      this.failPutsFor.delete(key);
      throw new Error('SIMULATED_PUT_FAILURE');
    }
    if (options.ifNoneMatch && this.objects.has(key)) return { created: false };
    this.objects.set(key, { bytes: new Uint8Array(bytesOf(body)), contentType: options.contentType, metadata: { ...options.metadata } });
    return { created: true };
  }
  async get(key: string) { return this.objects.get(key)?.bytes ?? null; }
  async head(key: string) {
    const object = this.objects.get(key);
    return object ? { bytes: object.bytes.byteLength, contentType: object.contentType, metadata: object.metadata, etag: `"${sha256Hex(object.bytes).slice(0, 32)}"` } : null;
  }
  async list(prefix: string) { return [...this.objects.keys()].filter((key) => key.startsWith(prefix)).sort(); }
  async delete(key: string) { this.objects.delete(key); }
  async signedGetUrl(key: string, expiresInSeconds: number) { return `memory://${this.bucket}/${key}?expires=${expiresInSeconds}`; }
}

/**
 * Directory-backed store for the local end-to-end harness only. Refuses to run
 * in production. Conditional create uses O_EXCL ('wx'), so it is atomic too.
 */
export class FileSystemTrainingObjectStore implements TrainingObjectStore {
  constructor(private readonly root: string, readonly bucket = `fs:${path.basename(root)}`) {
    if (process.env.NODE_ENV === 'production') throw new Error('FILESYSTEM_TRAINING_STORE_NOT_ALLOWED_IN_PRODUCTION');
  }
  private file(key: string) {
    if (key.includes('..') || key.startsWith('/')) throw new Error('INVALID_OBJECT_KEY');
    return path.join(this.root, key);
  }
  async put(key: string, body: string | Uint8Array, options: PutOptions) {
    const file = this.file(key);
    await mkdir(path.dirname(file), { recursive: true });
    try {
      await writeFile(file, bytesOf(body), { flag: options.ifNoneMatch ? 'wx' : 'w' });
    } catch (error) {
      if (options.ifNoneMatch && (error as NodeJS.ErrnoException).code === 'EEXIST') return { created: false };
      throw error;
    }
    await writeFile(`${file}.meta.json`, JSON.stringify({ contentType: options.contentType, metadata: options.metadata ?? {} }));
    return { created: true };
  }
  async get(key: string) {
    try { return new Uint8Array(await readFile(this.file(key))); } catch { return null; }
  }
  async head(key: string) {
    try {
      const info = await stat(this.file(key));
      const meta = JSON.parse(await readFile(`${this.file(key)}.meta.json`, 'utf8').catch(() => '{}')) as { contentType?: string; metadata?: Record<string, string> };
      return { bytes: info.size, contentType: meta.contentType ?? null, metadata: meta.metadata ?? {}, etag: null };
    } catch {
      return null;
    }
  }
  async list(prefix: string) {
    const keys: string[] = [];
    const walk = async (dir: string) => {
      for (const entry of await readdir(dir, { withFileTypes: true }).catch(() => [])) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) await walk(full);
        else if (!entry.name.endsWith('.meta.json')) keys.push(path.relative(this.root, full).split(path.sep).join('/'));
      }
    };
    await walk(this.root);
    return keys.filter((key) => key.startsWith(prefix)).sort();
  }
  async delete(key: string) {
    await rm(this.file(key), { force: true });
    await rm(`${this.file(key)}.meta.json`, { force: true });
  }
  async signedGetUrl(key: string) { return `file://${this.file(key)}`; }
}

let cached: TrainingObjectStore | null = null;

/**
 * The training store for this process. Production: R2 with the training-only
 * credentials. `TRAINING_OBJECT_STORE_DIR` selects the filesystem store for the
 * local e2e harness (never honoured in production).
 */
export function trainingObjectStore(env: Record<string, string | undefined> = process.env): TrainingObjectStore {
  if (cached) return cached;
  const dir = env.TRAINING_OBJECT_STORE_DIR?.trim();
  if (dir && env.NODE_ENV !== 'production') {
    cached = new FileSystemTrainingObjectStore(dir);
    return cached;
  }
  const config = getTrainingR2Config(env as NodeJS.ProcessEnv);
  cached = new R2TrainingObjectStore(createTrainingR2Client(config), config.bucket);
  return cached;
}

/** Test hook. */
export function setTrainingObjectStore(store: TrainingObjectStore | null) {
  cached = store;
}
