import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import UserActivation from '@/models/UserActivation';

const TYPES = new Set(['save_prompt', 'use_prompt', 'generate_image', 'generate_video', 'generate_web']);

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null) as { activationType?: string } | null;
  if (!body?.activationType || !TYPES.has(body.activationType)) {
    return NextResponse.json({ error: 'Invalid activation type' }, { status: 400 });
  }

  await connectToDatabase();
  const result = await UserActivation.updateOne(
    { userId },
    { $setOnInsert: { userId, activatedAt: new Date(), activationType: body.activationType } },
    { upsert: true }
  );

  return NextResponse.json({ firstActivation: result.upsertedCount > 0 });
}
