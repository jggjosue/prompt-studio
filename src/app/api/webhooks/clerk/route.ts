import { Webhook } from 'svix';
import { NextResponse } from 'next/server';
import { reportOperationalError } from '@/lib/observability-server';
import { headers } from 'next/headers';

import connectToDatabase from '@/lib/mongoose';
import NewUser from '@/models/NewUser';
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
  created_at?: number;
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
    reportOperationalError({ category: 'server_error', name: 'clerk_registered_user_sync', route: '/api/webhooks/clerk', userId: evt.data.id, metadata: { operation: 'sync_registered_user', provider: 'clerk', correlationId: evt.data.id, eventType: evt.type } }, error);
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
    reportOperationalError({ category: 'server_error', name: 'clerk_profile_sync', route: '/api/webhooks/clerk', userId: evt.data.id, metadata: { operation: 'sync_profile', provider: 'clerk', correlationId: evt.data.id, eventType: evt.type } }, error);
  });

  if (evt.type === 'user.created') {
    try {
      await NewUser.updateOne(
        { email },
        {
          $setOnInsert: {
            email,
            createdAt: evt.data.created_at
              ? new Date(evt.data.created_at)
              : new Date(),
          },
        },
        { upsert: true }
      );
    } catch (error) {
      reportOperationalError({ category: 'server_error', name: 'clerk_new_user_sync', route: '/api/webhooks/clerk', userId: evt.data.id, metadata: { operation: 'sync_new_user', provider: 'clerk', correlationId: evt.data.id, eventType: evt.type } }, error);
      // Clerk/Svix retries non-2xx webhook responses. The operation is
      // idempotent, so retrying cannot overwrite or duplicate this user.
      return NextResponse.json(
        { error: 'New user synchronization to MongoDB failed' },
        { status: 503 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
