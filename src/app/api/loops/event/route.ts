import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { sendLoopsEvent } from '@/lib/loops';
import { LOOPS_EVENTS } from '@/lib/loops-events';
import { clerkClient } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const eventKey = body?.eventKey as keyof typeof LOOPS_EVENTS | undefined;
  const payload = (body?.payload ?? {}) as Record<string, unknown>;

  if (!eventKey || !(eventKey in LOOPS_EVENTS)) {
    return NextResponse.json({ error: 'Invalid eventKey' }, { status: 400 });
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const email = user.primaryEmailAddress?.emailAddress;
  if (!email) {
    return NextResponse.json({ error: 'Missing email' }, { status: 400 });
  }

  await sendLoopsEvent(
    {
      email,
      userId,
      eventName: LOOPS_EVENTS[eventKey],
      eventProperties: {
        ...payload,
        userId,
      },
      mailingLists: {
        welcome: eventKey === 'welcome',
        resources: eventKey === 'resources' || eventKey === 'download',
        promotions:
          eventKey === 'premium_offer' ||
          eventKey === 'startup_offer' ||
          eventKey === 'upgrade' ||
          eventKey === 'affiliate_interest',
        upsells:
          eventKey === 'premium_offer' ||
          eventKey === 'startup_offer' ||
          eventKey === 'upgrade' ||
          eventKey === 'cart_abandonment' ||
          eventKey === 'inactive_30d',
      },
    },
    `${userId}:${eventKey}`
  );

  return NextResponse.json({ received: true });
}
