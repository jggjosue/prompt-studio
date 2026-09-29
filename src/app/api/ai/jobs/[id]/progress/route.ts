import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';
import connectToDatabase from '@/lib/mongoose';
import AIGenerationJob from '@/models/AIGenerationJob';

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const headers = cacheHeaders('private-no-store');
  const expected = process.env.AI_GENERATION_WORKER_TOKEN?.trim();
  if (!expected || request.headers.get('authorization') !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers });
  }
  const { id } = await context.params;
  const raw = await request.json().catch(() => null) as { progress?: unknown; message?: unknown; ownershipToken?: unknown } | null;
  const progress = Number(raw?.progress);
  const message = typeof raw?.message === 'string' ? raw.message.trim().slice(0, 160) : '';
  const ownershipToken = typeof raw?.ownershipToken === 'string' ? raw.ownershipToken.trim() : '';
  if (!/^[a-f0-9]{24}$/i.test(id) || !Number.isFinite(progress) || progress < 10 || progress > 95 || !ownershipToken) {
    return NextResponse.json({ error: 'Progreso inválido.' }, { status: 400, headers });
  }
  await connectToDatabase();
  const job = await AIGenerationJob.findOneAndUpdate(
    { _id: id, lockToken: ownershipToken, status: { $in: ['processing', 'uploading', 'finalizing'] } },
    { $max: { progress: Math.floor(progress) }, $set: { ...(message ? { progressMessage: message } : {}), updatedAt: new Date() } },
    { returnDocument: 'after' }
  );
  if (!job) return NextResponse.json({ error: 'Trabajo no encontrado, ya terminado o sin propiedad vigente.' }, { status: 409, headers });
  return NextResponse.json({ received: true, progress: job.progress }, { headers });
}
