import { clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import UserActivity from '@/models/UserActivity';
import { sendLoopsEvent } from '@/lib/loops';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (secret) {
    const provided = request.headers.get('x-cron-secret');
    if (provided !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  await connectToDatabase();
  const cutoff = new Date(Date.now() - THIRTY_DAYS_MS);

  const inactiveUsers = await UserActivity.find({
    lastActiveAt: { $lte: cutoff },
    $or: [
      { inactivityNotifiedAt: null },
      { inactivityNotifiedAt: { $lte: cutoff } },
    ],
  })
    .sort({ lastActiveAt: 1 })
    .limit(200);

  const client = await clerkClient();

  for (const user of inactiveUsers) {
    const clerkUser = await client.users.getUser(user.userId).catch(() => null);
    const email = clerkUser?.primaryEmailAddress?.emailAddress || user.email;
    if (!email) continue;

    await sendLoopsEvent(
      {
        email,
        userId: user.userId,
        eventName: 'prompt_studio_inactive_30d',
        eventProperties: {
          source: 'cron',
          daysInactive: 30,
          message: 'Te perdiste 80 nuevas Landing Pages.',
        },
        mailingLists: {
          promotions: true,
          upsells: true,
        },
      },
      user.userId
    ).catch(error => {
      console.error('Failed to send inactivity reminder to Loops:', error);
    });

    user.inactivityNotifiedAt = new Date();
    await user.save();
  }

  return NextResponse.json({
    received: true,
    processed: inactiveUsers.length,
  });
}
