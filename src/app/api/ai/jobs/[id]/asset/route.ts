import { cacheHeaders } from '@/lib/cache-policy';
import connectToDatabase from '@/lib/mongoose';
import { getR2ObjectBytes } from '@/lib/r2-storage';
import AIGenerationJob from '@/models/AIGenerationJob';
import { auth } from '@clerk/nextjs/server';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';

const MIME_BY_EXTENSION: Record<string, string> = {
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', avif: 'image/avif', gif: 'image/gif', svg: 'image/svg+xml',
  mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime',
};

type AssetRef = { key?: unknown; contentType?: unknown };

/** Resolves the R2 key for asset `index` of a job result (new `assets[]` or legacy `imageKey`). */
function assetKeyFor(result: Record<string, unknown> | undefined, index: number): { key: string; contentType: string | null } | null {
  const assets = Array.isArray(result?.assets) ? result.assets as AssetRef[] : [];
  const asset = assets[index];
  if (asset && typeof asset.key === 'string') {
    return { key: asset.key, contentType: typeof asset.contentType === 'string' ? asset.contentType : null };
  }
  if (index === 0 && typeof result?.imageKey === 'string') return { key: result.imageKey, contentType: null };
  return null;
}

/**
 * GET /api/ai/jobs/[id]/asset[?index=n]
 *
 * Streams a generated image or video from R2 to its owner. Assets are never
 * exposed through a public bucket URL: the job must belong to the caller and
 * the key must live under the caller's own prefix.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const headers = cacheHeaders('private-no-store');
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Inicia sesión.' }, { status: 401, headers });
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: 'Archivo no encontrado.' }, { status: 404, headers });
  const index = Number(new URL(request.url).searchParams.get('index') ?? 0);
  if (!Number.isInteger(index) || index < 0 || index > 16) return NextResponse.json({ error: 'Archivo no encontrado.' }, { status: 404, headers });

  await connectToDatabase();
  const job = await AIGenerationJob.findOne({ _id: id, userId, status: 'completed' }).select('result').lean();
  const asset = assetKeyFor(job?.result as Record<string, unknown> | undefined, index);
  if (!asset || !asset.key.startsWith(`users/${userId}/generations/`) || asset.key.includes('..')) {
    return NextResponse.json({ error: 'Archivo no encontrado.' }, { status: 404, headers });
  }
  const bytes = await getR2ObjectBytes(asset.key);
  if (!bytes) return NextResponse.json({ error: 'Archivo no encontrado.' }, { status: 404, headers });
  const extension = asset.key.split('.').pop()?.toLowerCase() || 'png';
  const responseHeaders = new Headers(headers);
  responseHeaders.set('Content-Type', asset.contentType || MIME_BY_EXTENSION[extension] || 'application/octet-stream');
  responseHeaders.set('Content-Length', String(bytes.length));
  responseHeaders.set('X-Content-Type-Options', 'nosniff');
  return new Response(new Uint8Array(bytes), { headers: responseHeaders });
}
