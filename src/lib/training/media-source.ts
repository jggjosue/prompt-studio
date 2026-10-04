import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { getR2BucketName, getR2ObjectBytes } from '@/lib/r2-storage';
import type { TrainingAssetReference } from '@/lib/training-data-contract';

/**
 * Reads generated assets from where /generate stored them, so the worker can
 * copy eligible ones into the private training bucket.
 *
 * Least privilege: the media bucket is read with the media credentials (read
 * access is enough), never with the training credentials, and only the media
 * bucket configured for this app is accepted. Remote URLs are fetched only for
 * hosts listed in TRAINING_ASSET_FETCH_ALLOWED_HOSTS, over https, with a size cap.
 */
export interface MediaAssetSource {
  readR2(reference: TrainingAssetReference): Promise<Uint8Array | null>;
  fetchRemote(url: string, maxBytes: number): Promise<{ bytes: Uint8Array; contentType: string | null } | null>;
}

export class AppMediaAssetSource implements MediaAssetSource {
  constructor(private readonly env: Record<string, string | undefined> = process.env) {}

  async readR2(reference: TrainingAssetReference) {
    if (reference.provider !== 'cloudflare-r2' || reference.bucket !== getR2BucketName()) return null;
    const bytes = await getR2ObjectBytes(reference.key);
    return bytes ? new Uint8Array(bytes) : null;
  }

  async fetchRemote(url: string, maxBytes: number) {
    const allowed = (this.env.TRAINING_ASSET_FETCH_ALLOWED_HOSTS ?? '').split(',').map((host) => host.trim().toLowerCase()).filter(Boolean);
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return null;
    }
    if (parsed.protocol !== 'https:' || !allowed.includes(parsed.hostname.toLowerCase())) return null;
    const response = await fetch(parsed, { redirect: 'error', signal: AbortSignal.timeout(60_000) });
    if (!response.ok || !response.body) return null;
    const declared = Number(response.headers.get('content-length') ?? 0);
    if (declared > maxBytes) return null;
    const chunks: Uint8Array[] = [];
    let total = 0;
    const reader = response.body.getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return { bytes, contentType: response.headers.get('content-type') };
  }
}

/** Local e2e harness: reads media objects from a directory (never in production). */
export class DirectoryMediaAssetSource implements MediaAssetSource {
  constructor(private readonly root: string, private readonly bucket: string) {
    if (process.env.NODE_ENV === 'production') throw new Error('DIRECTORY_MEDIA_SOURCE_NOT_ALLOWED_IN_PRODUCTION');
  }
  async readR2(reference: TrainingAssetReference) {
    if (reference.bucket !== this.bucket || reference.key.includes('..')) return null;
    try { return new Uint8Array(await readFile(path.join(this.root, reference.key))); } catch { return null; }
  }
  async fetchRemote() { return null; }
}

let cached: MediaAssetSource | null = null;

export function mediaAssetSource(env: Record<string, string | undefined> = process.env): MediaAssetSource {
  if (cached) return cached;
  const dir = env.TRAINING_MEDIA_SOURCE_DIR?.trim();
  cached = dir && env.NODE_ENV !== 'production'
    ? new DirectoryMediaAssetSource(dir, getR2BucketName())
    : new AppMediaAssetSource(env);
  return cached;
}

export function setMediaAssetSource(source: MediaAssetSource | null) {
  cached = source;
}
