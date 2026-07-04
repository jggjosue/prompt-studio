import { Webhook } from 'svix';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { upsertLoopsContact, sendLoopsEvent } from '@/lib/loops';
import { sendOnboardingEmail, upsertResendContact } from '@/lib/resend';
import connectToDatabase from '@/lib/mongoose';
import UserProfile from '@/models/UserProfile';
import RegisteredUser from '@/models/RegisteredUser';

type ClerkUserEvent = {
  id: string;
  primary_email_address_id?: string | null;
  email_addresses?: Array<{ id?: string; email_address: string }>;
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
  public_metadata?: Record<string, unknown>;
  private_metadata?: Record<string, unknown>;
};

function getPrimaryEmail(user: ClerkUserEvent): string | null {
  const primary = user.email_addresses?.find(
    address => address.id === user.primary_email_address_id
  );
  return primary?.email_address ?? user.email_addresses?.[0]?.email_address ?? null;
}

export async function POST(req: Request) {
  const payload = await req.text();
  const headerStore = await headers();
  const svixId = headerStore.get('svix-id');
  const svixTimestamp = headerStore.get('svix-timestamp');
  const svixSignature = headerStore.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing Clerk webhook headers' }, { status: 400 });
  }

  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Missing CLERK_WEBHOOK_SECRET' }, { status: 500 });
  }

  let evt: { type: string; data: ClerkUserEvent };
  try {
    const webhook = new Webhook(secret);
    evt = webhook.verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as { type: string; data: ClerkUserEvent };
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Invalid Clerk webhook signature' },
      { status: 400 }
    );
  }

  if (evt.type !== 'user.created' && evt.type !== 'user.updated') {
    return NextResponse.json({ received: true });
  }

  const email = getPrimaryEmail(evt.data);
  if (!email) {
    return NextResponse.json({ error: 'User has no primary email' }, { status: 400 });
  }

  const fullName = [evt.data.first_name, evt.data.last_name].filter(Boolean).join(' ').trim();
  const birthDateRaw =
    evt.data.public_metadata?.birthDate ??
    evt.data.public_metadata?.birthday ??
    evt.data.private_metadata?.birthDate ??
    evt.data.private_metadata?.birthday ??
    null;
  const birthDate = typeof birthDateRaw === 'string' ? birthDateRaw : null;
  const paypalEmailRaw =
    evt.data.private_metadata?.affiliatePaypalEmail ??
    evt.data.private_metadata?.paypalEmail ??
    evt.data.public_metadata?.paypalEmail ??
    null;
  const paypalEmail = typeof paypalEmailRaw === 'string' ? paypalEmailRaw : null;

  await connectToDatabase();

  await RegisteredUser.updateOne(
    { email },
    { $setOnInsert: { email } },
    { upsert: true }
  ).catch(error => {
    console.error('Failed to sync registered user in webhook:', error);
  });

  await UserProfile.findOneAndUpdate(
    { userId: evt.data.id },
    {
      $set: {
        userId: evt.data.id,
        email,
        birthDate,
        paypalEmail,
        lastUpdatedAt: new Date(),
      },
    },
    { upsert: true, returnDocument: 'after' }
  ).catch(error => {
    console.error('Failed to sync Clerk profile to Mongo:', error);
  });

  await upsertLoopsContact({
    email,
    name: fullName || undefined,
    firstName: evt.data.first_name ?? undefined,
    lastName: evt.data.last_name ?? undefined,
    source: 'clerk',
    subscribed: true,
    userGroup: 'clerk-users',
    userId: evt.data.id,
  }).catch(error => {
    console.error('Failed to sync Clerk user to Loops:', error);
  });

  const resendResult = await upsertResendContact({
    email,
    firstName: evt.data.first_name ?? undefined,
    lastName: evt.data.last_name ?? undefined,
  });

  if (resendResult.error) {
    console.error('Failed to sync Clerk user to Resend:', resendResult.error);
    // A non-2xx response tells Clerk/Svix to retry instead of silently losing
    // the contact while reporting the webhook as successfully processed.
    return NextResponse.json(
      { error: 'Resend contact synchronization failed' },
      { status: 503 }
    );
  }

  if (evt.type === 'user.created') {
    await sendLoopsEvent({
      email,
      userId: evt.data.id,
      eventName: 'prompt_studio_welcome',
      eventProperties: {
        source: 'clerk',
        fullName: fullName || email,
      },
      mailingLists: {
        welcome: true,
        resources: true,
        promotions: true,
        upsells: true,
      },
    }, evt.data.id).catch(error => {
      console.error('Failed to send Clerk welcome event to Loops:', error);
    });

    await sendOnboardingEmail({
      to: email,
      name: fullName || undefined,
    }).catch(error => {
      console.error('Failed to send onboarding email:', error);
    });
  }

  return NextResponse.json({ received: true });
}
