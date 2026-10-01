import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import { recordReactivationStage } from '@/lib/reactivation-funnel';

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json().catch(() => null) as { stage?: string } | null;
  if (!body?.stage || !['checkout', 'purchase'].includes(body.stage)) {
    return NextResponse.json({ error: 'Invalid stage' }, { status: 400 });
  }
  await connectToDatabase();
  const attempt = await recordReactivationStage(userId, body.stage as 'checkout' | 'purchase');
  return NextResponse.json({ attributed: Boolean(attempt) });
}
