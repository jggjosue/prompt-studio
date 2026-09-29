import { cacheHeaders } from '@/lib/cache-policy';
import connectToDatabase from '@/lib/mongoose';
import { getR2ObjectBytes } from '@/lib/r2-storage';
import AIGenerationJob from '@/models/AIGenerationJob';
import { auth } from '@clerk/nextjs/server';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';

const MIME_BY_EXTENSION: Record<string, string> = {
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', avif: 'image/avif', gif: 'image/gif', svg: 'image/svg+xml',
};

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const headers = cacheHeaders('private-no-store');
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Inicia sesión.' }, { status: 401, headers });
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: 'Imagen no encontrada.' }, { status: 404, headers });

  await connectToDatabase();
  const job = await AIGenerationJob.findOne({ _id: id, userId, status: 'completed' }).select('result').lean();
  const result = job?.result as Record<string, unknown> | undefined;
  const imageKey = typeof result?.imageKey === 'string' ? result.imageKey : '';
  if (!imageKey.startsWith(`users/${userId}/generations/`)) {
    return NextResponse.json({ error: 'Imagen no encontrada.' }, { status: 404, headers });
  }
  const bytes = await getR2ObjectBytes(imageKey);
  if (!bytes) return NextResponse.json({ error: 'Imagen no encontrada.' }, { status: 404, headers });
  const extension = imageKey.split('.').pop()?.toLowerCase() || 'png';
  const responseHeaders = new Headers(headers);
  responseHeaders.set('Content-Type', MIME_BY_EXTENSION[extension] || 'image/png');
  responseHeaders.set('Content-Length', String(bytes.length));
  return new Response(new Uint8Array(bytes), {
    headers: responseHeaders,
  });
}
