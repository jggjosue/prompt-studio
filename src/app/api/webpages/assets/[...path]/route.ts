import { NextResponse } from 'next/server';
import { getR2AssetBytes, getR2ObjectBytes } from '@/lib/r2-storage';
import {
  contentTypeForAsset,
  githubWebPageAssetUrl,
} from '@/lib/web-page-media';

export const runtime = 'nodejs';

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

export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const filename = path.join('/');

  // Reject empty paths or traversal attempts
  if (!filename || filename.includes('..') || !ASSET_RE.test(filename)) {
    return NextResponse.json({ error: 'Ruta de asset no válida' }, { status: 400 });
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

  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      'Content-Type': contentTypeForAsset(filename),
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
