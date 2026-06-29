import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import UserInterest from '@/models/UserInterest';

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const interest = String(body?.interest ?? '').trim();
  if (!interest) {
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
      $addToSet: { interests: interest },
    },
    { upsert: true, returnDocument: 'after' }
  );

  return NextResponse.json({ received: true });
}
