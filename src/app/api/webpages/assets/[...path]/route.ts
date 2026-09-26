import { cdnCacheHeaders } from '@/lib/cdn-cache';
import { cacheGetOrSet, webAssetCacheKey } from '@/lib/server-cache';
import {
  pickModernImageFormat,
  transcodeRasterImage,
} from '@/lib/image-transcode';
import {
  getR2AssetBytes,
  getR2ObjectBytes,
  getR2ObjectDownloadUrl,
  r2ObjectExists,
} from '@/lib/r2-storage';
import { githubWebPageAssetUrl } from '@/lib/web-page-media';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
/** Debe coincidir con `VERCEL_EDGE_REGIONS` en `@/lib/cdn-cache` (literal requerido por Next.js). */
export const preferredRegion = [
  'iad1',
  'sfo1',
  'cdg1',
  'fra1',
  'sin1',
  'syd1',
  'gru1',
  'hnd1',
];

// Allows slug/filename.ext and plain filename.ext (no traversal)
const ASSET_RE = /^[a-zA-Z0-9][a-zA-Z0-9._/-]*[a-zA-Z0-9._-]$|^[a-zA-Z0-9._-]+$/;

function r2KeysForSluggedPath(segments: string[]): string[] {
  const joined = segments.join('/');
  const keys = new Set<string>();
  if (segments.length >= 2) {
    // /api/webpages/assets/{slug}/{file} → look in webpages/{slug}/{file} and {slug}/{file}
    const slug = segments[0];
    const rest = segments.slice(1).join('/');
    keys.add(`webpages/${slug}/${rest}`);
    keys.add(`${slug}/${rest}`);
  }
  keys.add(joined);
  keys.add(`webpages/${joined}`);
  return [...keys];
}

function parseWidthParam(value: string | null): number | undefined {
  if (!value) return undefined;
  const w = Number.parseInt(value, 10);
  if (!Number.isFinite(w) || w < 1 || w > 3840) return undefined;
  return w;
}

function parseQualityParam(value: string | null): number {
  if (!value) return 75;
  const q = Number.parseInt(value, 10);
  if (!Number.isFinite(q) || q < 1 || q > 100) return 75;
  return q;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const filename = path.join('/');
  const { searchParams } = new URL(request.url);
  const width = parseWidthParam(searchParams.get('w'));
  const quality = parseQualityParam(searchParams.get('q'));
  const format = pickModernImageFormat(request.headers.get('accept'));
  const isVideo = /\.(mp4|webm|avi|mov)$/i.test(filename);

  // Reject empty paths or traversal attempts
  if (!filename || filename.includes('..') || !ASSET_RE.test(filename)) {
    return NextResponse.json({ error: 'Ruta de asset no válida' }, { status: 400 });
  }

  // Large immutable videos live in R2. Return a short-lived direct URL so the
  // Function performs authorization/routing only and never proxies the bytes.
  if (isVideo) {
    for (const key of r2KeysForSluggedPath(path)) {
      if (!(await r2ObjectExists(key))) continue;
      const directUrl = await getR2ObjectDownloadUrl(key);
      if (directUrl) {
        return NextResponse.redirect(directUrl, {
          status: 307,
          headers: { 'Cache-Control': 'private, no-store' },
        });
      }
    }
  }

  // Try slug-aware R2 keys first, then fall back to getR2AssetBytes
  let bytes: Buffer | null = null;
  if (path.length >= 2) {
    for (const key of r2KeysForSluggedPath(path)) {
      bytes = await getR2ObjectBytes(key);
      if (bytes) break;
    }
  }

  if (!bytes) bytes = await getR2AssetBytes(filename);

  if (!bytes) {
    try {
      const { join } = await import('path');
      const { readFile } = await import('fs/promises');
      const basePath = process.cwd();
      const publicDir = 'public';
      const webpagesDir = 'webpages';
      const localPath = join(basePath, publicDir, webpagesDir, filename);
      bytes = await readFile(localPath);
    } catch {
      // ignore
    }
  }

  if (!bytes) {
    try {
      const fallback = await fetch(githubWebPageAssetUrl(filename), {
        signal: AbortSignal.timeout(15_000),
      });
      if (fallback.ok) {
        bytes = Buffer.from(await fallback.arrayBuffer());
      }
    } catch {
      bytes = null;
    }
  }

  if (!bytes?.length) {
    return NextResponse.json(
      { error: `Asset no encontrado: ${filename}` },
      { status: 404 }
    );
  }

  const assetKey = webAssetCacheKey(filename, width, quality, format);
  if (isVideo) {
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        'Content-Type': contentTypeForAsset(filename),
        ...cdnCacheHeaders('staleWhileRevalidate'),
      },
    });
  }

  try {
    const { buffer, contentType } = await cacheGetOrSet(
      'web-asset',
      assetKey,
      async () =>
        transcodeRasterImage(bytes, filename, {
          format,
          width,
          quality,
        }),
      { ttlMs: 24 * 60 * 60 * 1000 }
    );

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': contentType,
        ...cdnCacheHeaders('immutable'),
        Vary: 'Accept',
      },
    });
  } catch {
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        'Content-Type': contentTypeForAsset(filename),
        ...cdnCacheHeaders('staleWhileRevalidate'),
      },
    });
  }
}

function contentTypeForAsset(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.css')) return 'text/css; charset=utf-8';
  if (lower.endsWith('.js') || lower.endsWith('.mjs')) return 'application/javascript; charset=utf-8';
  if (lower.endsWith('.html')) return 'text/html; charset=utf-8';
  if (lower.endsWith('.json')) return 'application/json; charset=utf-8';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.avif')) return 'image/avif';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.svg')) return 'image/svg+xml';
  if (lower.endsWith('.mp4')) return 'video/mp4';
  if (lower.endsWith('.webm')) return 'video/webm';
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.woff')) return 'font/woff';
  if (lower.endsWith('.woff2')) return 'font/woff2';
  return 'application/octet-stream';
}
