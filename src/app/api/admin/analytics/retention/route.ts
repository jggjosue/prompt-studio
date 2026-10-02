import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { getActivationRetentionMetrics } from '@/lib/retention-analytics';

const DAY_MS = 86_400_000;

export async function GET(request: NextRequest) {
  const { userId, sessionClaims } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
  if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const daysRaw = Number(request.nextUrl.searchParams.get('days') ?? 30);
  const days = Math.min(90, Math.max(1, Number.isFinite(daysRaw) ? Math.floor(daysRaw) : 30));
  const to = new Date();
  const from = new Date(to.getTime() - days * DAY_MS);
  return NextResponse.json(await getActivationRetentionMetrics({ from, to }));
}
