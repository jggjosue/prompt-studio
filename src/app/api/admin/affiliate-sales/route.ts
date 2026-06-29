import { NextResponse } from 'next/server';
import { isPremiumJoAdmin } from '@/lib/admin-auth';
import connectToDatabase from '@/lib/mongoose';
import AffiliateSale from '@/models/AffiliateSale';
import AffiliateUserStats from '@/models/AffiliateUserStats';
import AffiliateDailyStats from '@/models/AffiliateDailyStats';

export async function GET(request: Request) {
  if (!(await isPremiumJoAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  await connectToDatabase();

  const url = new URL(request.url);
  const referrerUserId = url.searchParams.get('referrerUserId')?.trim() || undefined;
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit') ?? '250'), 1), 1000);
  const skip = Math.max(Number(url.searchParams.get('skip') ?? '0'), 0);

  const query = referrerUserId ? { referrerUserId } : {};
  const [sales, users, daily] = await Promise.all([
    AffiliateSale.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    AffiliateUserStats.find(referrerUserId ? { clerkUserId: referrerUserId } : {}).sort({ salesRegistered: -1 }).lean(),
    AffiliateDailyStats.find(referrerUserId ? { clerkUserId: referrerUserId } : {}).sort({ dateKey: -1 }).limit(90).lean(),
  ]);

  return NextResponse.json({
    filters: {
      referrerUserId: referrerUserId ?? null,
      limit,
      skip,
    },
    counts: {
      sales: sales.length,
      users: users.length,
      historyRows: daily.length,
    },
    sales,
    users,
    daily,
  }, {
    headers: {
      'Cache-Control': 'private, no-store',
    },
  });
}
