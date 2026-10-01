import { isPremiumJoAdmin } from '@/lib/admin-auth';
import { cacheHeaders } from '@/lib/cache-policy';
import { getCreditEconomyAnalytics } from '@/lib/credit-economy-analytics';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const headers = cacheHeaders('private-no-store');
  if (!(await isPremiumJoAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers });
  const requestedDays = Number(new URL(request.url).searchParams.get('days') ?? 30);
  return NextResponse.json({ analytics: await getCreditEconomyAnalytics(requestedDays) }, { headers });
}
