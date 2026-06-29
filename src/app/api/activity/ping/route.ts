import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import UserActivity from '@/models/UserActivity';

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const email = user.primaryEmailAddress?.emailAddress;
  if (!email) {
    return NextResponse.json({ error: 'Missing email' }, { status: 400 });
  }

  await connectToDatabase();
  const now = new Date();

  await UserActivity.findOneAndUpdate(
    { userId },
    {
      $set: {
        userId,
        email,
        lastActiveAt: now,
      },
      $setOnInsert: {
        firstSeenAt: now,
      },
    },
    { upsert: true, returnDocument: 'after' }
  );

  return NextResponse.json({ received: true });
}
