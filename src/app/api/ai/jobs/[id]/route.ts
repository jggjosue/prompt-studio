import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';
import connectToDatabase from '@/lib/mongoose';
import { serializeAIJob } from '@/lib/ai-job-serializer';
import AIGenerationJob from '@/models/AIGenerationJob';

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const headers = cacheHeaders('private-no-store');
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers });
  const { id } = await context.params;
  if (!/^[a-f0-9]{24}$/i.test(id)) return NextResponse.json({ error: 'Trabajo no encontrado.' }, { status: 404, headers });
  await connectToDatabase();
  const job = await AIGenerationJob.findOne({ _id: id, userId });
  if (!job) return NextResponse.json({ error: 'Trabajo no encontrado.' }, { status: 404, headers });
  const serialized = serializeAIJob(job);
  // Adaptive polling (#838): clients should wait this long before asking again.
  if (serialized.pollAfterMs !== null) headers.set('Retry-After', String(Math.ceil(serialized.pollAfterMs / 1000)));
  return NextResponse.json({ job: serialized }, { headers });
}
