import { NextResponse } from 'next/server';
import { requireCronOrAdmin } from '@/lib/api-auth';
import connectToDatabase from '@/lib/mongoose';
import { sweepTrainingOutbox } from '@/lib/training/training-queue';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * GET /api/cron/training-outbox
 *
 * Re-sends training records that never reached the SQS queue (queue outage,
 * missing configuration, crashed request) or whose message was lost. Schedule
 * every 5 minutes. Returns counts only.
 */
export async function GET(request: Request) {
  const denied = await requireCronOrAdmin(request);
  if (denied) return denied;
  await connectToDatabase();
  const limit = Number(new URL(request.url).searchParams.get('limit') ?? 200);
  const result = await sweepTrainingOutbox({ limit: Number.isFinite(limit) ? limit : 200 });
  return NextResponse.json(result);
}
