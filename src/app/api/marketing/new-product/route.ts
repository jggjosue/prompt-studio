import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import UserInterest from '@/models/UserInterest';
import { sendProductAnnouncementEmail } from '@/lib/resend';
import { sendLoopsEvent } from '@/lib/loops';

export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (secret) {
    const provided = req.headers.get('x-cron-secret');
    if (provided !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const body = await req.json().catch(() => null);
  const productType = String(body?.productType ?? '').trim();
  const title = String(body?.title ?? '').trim();
  const href = String(body?.href ?? '').trim();
  if (!productType || !title) {
    return NextResponse.json({ error: 'Missing product data' }, { status: 400 });
  }

  await connectToDatabase();
  const interestedUsers = await UserInterest.find({ interests: productType }).limit(500);

  for (const user of interestedUsers) {
    await sendLoopsEvent(
      {
        email: user.email,
        userId: user.userId,
        eventName: 'prompt_studio_new_product',
        eventProperties: {
          productType,
          title,
          href: href || null,
        },
        mailingLists: {
          promotions: true,
          upsells: true,
        },
      },
      `${user.userId}:${productType}:${title}`
    ).catch(error => {
      console.error('Failed to send new product event to Loops:', error);
    });

    await sendProductAnnouncementEmail({
      to: user.email,
      title,
      href: href || undefined,
      category: productType,
    }).catch(error => {
      console.error('Failed to send product email:', error);
    });
  }

  return NextResponse.json({ received: true, recipients: interestedUsers.length });
}
