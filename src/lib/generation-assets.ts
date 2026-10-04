import 'server-only';
import { createHash } from 'node:crypto';
import { getR2BucketName, putR2Object } from '@/lib/r2-storage';

/**
 * Moves generated binaries (images, videos) out of the job result and into
 * Cloudflare R2, leaving only a reference in MongoDB.
 *
 * Before this, providers' base64 payloads were stored verbatim in
 * AIGenerationJob.result and copied again into chat messages. Now the result
 * keeps `asset` / `assets` references and its `imageUrl` / `videoUrl` point at
 * the authenticated GET /api/ai/jobs/[id]/asset route.
 *
 * Keys are content-addressed under the owner's prefix:
 *   users/{userId}/generations/{sha256}.{ext}
 * so identical outputs are stored once and the key reveals nothing guessable.
 *
 * Failure policy: if R2 is unavailable the original result is returned
 * unchanged. Showing the user their generation matters more than the move.
 */

export type GenerationAssetReference = {
  provider: 'cloudflare-r2';
  bucket: string;
  key: string;
  contentType: string;
  contentHash: string;
  bytes: number;
  kind: 'image' | 'video';
};

type PutObject = (key: string, bytes: Buffer, contentType: string) => Promise<unknown>;

const EXTENSIONS: Record<string, string> = {
  'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/avif': 'avif', 'image/gif': 'gif',
  'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov',
};
const MAX_BYTES = { image: 40 * 1024 * 1024, video: 250 * 1024 * 1024 };
const DATA_URL = /^data:([a-z]+\/[a-z0-9.+-]+);base64,([A-Za-z0-9+/=\s]+)$/i;

type Inline = { kind: 'image' | 'video'; contentType: string; base64: string; clear: (result: Record<string, unknown>, url: string) => void };

function inlineFromDataUrl(value: unknown): { contentType: string; base64: string } | null {
  if (typeof value !== 'string' || !value.startsWith('data:')) return null;
  const match = DATA_URL.exec(value);
  return match ? { contentType: match[1].toLowerCase(), base64: match[2] } : null;
}

/** Finds inline binaries in the result shapes our providers return. */
function findInlineAssets(result: Record<string, unknown>): Inline[] {
  const found: Inline[] = [];
  for (const field of ['imageUrl', 'imageUri'] as const) {
    const inline = inlineFromDataUrl(result[field]);
    if (inline?.contentType.startsWith('image/')) {
      found.push({ kind: 'image', ...inline, clear: (target, url) => { target.imageUrl = url; if (field === 'imageUri') delete target.imageUri; } });
      break;
    }
  }
  if (!found.length && typeof result.bytesBase64Encoded === 'string') {
    const contentType = typeof result.mimeType === 'string' ? result.mimeType : 'image/png';
    found.push({ kind: 'image', contentType, base64: result.bytesBase64Encoded, clear: (target, url) => { delete target.bytesBase64Encoded; target.imageUrl = url; } });
  }
  const predictions = Array.isArray(result.predictions) ? result.predictions as Array<Record<string, unknown>> : [];
  predictions.forEach((prediction, index) => {
    if (found.length && index === 0 && found[0].kind === 'image') return;
    if (typeof prediction?.bytesBase64Encoded !== 'string') return;
    const contentType = typeof prediction.mimeType === 'string' ? prediction.mimeType : 'image/png';
    found.push({
      kind: 'image', contentType, base64: prediction.bytesBase64Encoded,
      clear: (target, url) => {
        const list = target.predictions as Array<Record<string, unknown>>;
        delete list[index].bytesBase64Encoded;
        list[index].imageUri = url;
        if (!target.imageUrl || String(target.imageUrl).startsWith('data:')) target.imageUrl = url;
      },
    });
  });
  const videoInline = inlineFromDataUrl(result.videoUrl);
  if (videoInline?.contentType.startsWith('video/')) {
    found.push({ kind: 'video', ...videoInline, clear: (target, url) => { target.videoUrl = url; } });
  } else if (typeof result.videoBase64 === 'string') {
    const contentType = typeof result.videoMimeType === 'string' ? result.videoMimeType : 'video/mp4';
    found.push({ kind: 'video', contentType, base64: result.videoBase64, clear: (target, url) => { delete target.videoBase64; target.videoUrl = url; } });
  }
  return found.filter((asset) => EXTENSIONS[asset.contentType]);
}

export function generationAssetKey(userId: string, contentHash: string, contentType: string) {
  if (!/^[A-Za-z0-9_-]{1,120}$/.test(userId) || !/^[a-f0-9]{64}$/.test(contentHash)) throw new Error('INVALID_GENERATION_ASSET_KEY');
  const extension = EXTENSIONS[contentType];
  if (!extension) throw new Error('UNSUPPORTED_GENERATION_ASSET_TYPE');
  return `users/${userId}/generations/${contentHash}.${extension}`;
}

export function generationAssetUrl(jobId: string, index: number) {
  return index === 0 ? `/api/ai/jobs/${jobId}/asset` : `/api/ai/jobs/${jobId}/asset?index=${index}`;
}

export async function externalizeGenerationAssets(
  input: { jobId: string; userId: string; result: Record<string, unknown> | null | undefined },
  deps: { put?: PutObject; bucket?: string } = {},
): Promise<{ result: Record<string, unknown> | null | undefined; assets: GenerationAssetReference[]; code: string | null }> {
  if (!input.result || typeof input.result !== 'object') return { result: input.result, assets: [], code: null };
  const inline = findInlineAssets(input.result);
  if (!inline.length) return { result: input.result, assets: [], code: null };
  const put = deps.put ?? putR2Object;
  const bucket = deps.bucket ?? getR2BucketName();
  const next = structuredClone(input.result);
  const assets: GenerationAssetReference[] = [];
  try {
    for (const item of inline) {
      const bytes = Buffer.from(item.base64.replace(/\s+/g, ''), 'base64');
      if (!bytes.length) throw new Error('EMPTY_GENERATION_ASSET');
      if (bytes.length > MAX_BYTES[item.kind]) throw new Error('GENERATION_ASSET_TOO_LARGE');
      const contentHash = createHash('sha256').update(bytes).digest('hex');
      const key = generationAssetKey(input.userId, contentHash, item.contentType);
      const stored = await put(key, bytes, item.contentType);
      if (stored === null) throw new Error('R2_NOT_CONFIGURED');
      assets.push({ provider: 'cloudflare-r2', bucket, key, contentType: item.contentType, contentHash, bytes: bytes.length, kind: item.kind });
      item.clear(next, generationAssetUrl(input.jobId, assets.length - 1));
    }
  } catch (error) {
    // Keep the inline result so the user still sees the generation.
    return { result: input.result, assets: [], code: error instanceof Error ? error.message.slice(0, 80) : 'GENERATION_ASSET_UPLOAD_FAILED' };
  }
  next.asset = assets[0];
  next.assets = assets;
  if (assets[0].kind === 'image') next.imageKey = assets[0].key;
  return { result: next, assets, code: null };
}
