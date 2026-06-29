import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import UserProfile from '@/models/UserProfile';
import { sendBirthdayEmail } from '@/lib/resend';
import { sendLoopsEvent } from '@/lib/loops';

function isBirthdayToday(birthDate: string | null | undefined) {
  if (!birthDate) return false;
  const parsed = new Date(birthDate);
  if (Number.isNaN(parsed.getTime())) return false;
  const now = new Date();
  return parsed.getUTCMonth() === now.getUTCMonth() && parsed.getUTCDate() === now.getUTCDate();
}

export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (secret) {
    const provided = req.headers.get('x-cron-secret');
    if (provided !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  await connectToDatabase();
  const birthdayUsers = await UserProfile.find({ birthDate: { $ne: null } }).limit(500);

  let sent = 0;
  for (const user of birthdayUsers) {
    if (!isBirthdayToday(user.birthDate)) continue;

    await sendBirthdayEmail({ to: user.email }).catch(error => {
      console.error('Failed to send birthday email:', error);
    });

    await sendLoopsEvent(
      {
        email: user.email,
        userId: user.userId,
        eventName: 'prompt_studio_birthday',
        eventProperties: {
          source: 'cron',
          birthday: true,
        },
        mailingLists: {
          promotions: true,
        },
      },
      `${user.userId}:${new Date().toISOString().slice(0, 10)}`
    ).catch(error => {
      console.error('Failed to send birthday loop event:', error);
    });

    sent += 1;
  }

  return NextResponse.json({ received: true, sent });
}
