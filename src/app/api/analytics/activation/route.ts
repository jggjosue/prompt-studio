import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import UserActivation from '@/models/UserActivation';
import { recordReactivationStage, recordUserProductActivity, type ReactivationCategory } from '@/lib/reactivation-funnel';
import { recordRetentionActivity } from '@/lib/retention-analytics';

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

  const categoryByType: Record<string, ReactivationCategory> = {
    save_prompt: 'prompt', use_prompt: 'prompt', generate_image: 'image',
    generate_video: 'video', generate_web: 'web',
  };
  const now = new Date();
  await Promise.all([
    recordUserProductActivity(userId, categoryByType[body.activationType], now),
    recordReactivationStage(userId, 'activation', now),
    recordRetentionActivity(userId, now),
  ]);

  return NextResponse.json({ firstActivation: result.upsertedCount > 0 });
}
