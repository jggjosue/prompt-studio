import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import UserInterest from '@/models/UserInterest';
import { cacheHeaders } from '@/lib/cache-policy';
import { rateLimit, tooManyRequests } from '@/lib/rate-limit';

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: cacheHeaders('private-no-store') });
  }

  const quota = await rateLimit({ key: `interests:${userId}`, limit: 30, windowMs: 60_000 });
  if (!quota.ok) return tooManyRequests(quota);

  const body = await req.json().catch(() => null);
  const input = Array.isArray(body?.interests) ? body.interests : [body?.interest];
  const interests = [...new Set(input.filter((item: unknown) => typeof item === 'string').map((item: string) => item.trim().toLowerCase().slice(0, 80)).filter(Boolean))].slice(0, 12);
  if (!interests.length) {
    return NextResponse.json({ error: 'Missing interest' }, { status: 400 });
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const email = user.primaryEmailAddress?.emailAddress;
  if (!email) {
    return NextResponse.json({ error: 'Missing email' }, { status: 400 });
  }

  await connectToDatabase();
  await UserInterest.findOneAndUpdate(
    { userId },
    {
      $set: {
        userId,
        email,
        lastUpdatedAt: new Date(),
      },
      $addToSet: { interests: { $each: interests } },
    },
    { upsert: true, returnDocument: 'after' }
  );

  return NextResponse.json({ received: true }, { headers: cacheHeaders('private-no-store') });
}
