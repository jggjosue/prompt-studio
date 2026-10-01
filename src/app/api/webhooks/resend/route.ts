import { NextResponse } from 'next/server';
import { Webhook } from 'svix';

import connectToDatabase from '@/lib/mongoose';
import { reportOperationalError } from '@/lib/observability-server';
import { suppressionPatch, type SuppressionReason } from '@/lib/email-suppression';
import EmailProviderEvent from '@/models/EmailProviderEvent';
import UserProfile from '@/models/UserProfile';

export const runtime = 'nodejs';

type ResendWebhookEvent = {
  type: string;
  created_at?: string;
  data?: {
    email_id?: string;
    to?: string[] | string;
    email?: string;
    bounce?: { type?: string };
  };
};

const HANDLED = new Set([
  'email.delivered',
  'email.bounced',
  'email.complained',
  'email.clicked',
  'contact.updated',
]);

function recipientOf(event: ResendWebhookEvent): string | null {
  const to = event.data?.to;
  const value = Array.isArray(to) ? to[0] : to ?? event.data?.email;
  return typeof value === 'string' ? value.trim().toLowerCase() : null;
}

function suppressionReason(event: ResendWebhookEvent): SuppressionReason | null {
  if (event.type === 'email.complained') return 'complaint';
  if (event.type === 'email.bounced' && event.data?.bounce?.type !== 'transient') return 'hard_bounce';
  // Resend contact.updated is used for subscription state changes. Only apply
  // unsubscribe when the payload explicitly says unsubscribed.
  if (event.type === 'contact.updated' && (event.data as Record<string, unknown> | undefined)?.unsubscribed === true) {
    return 'unsubscribe';
  }
  return null;
}

export async function POST(request: Request) {
  const payload = await request.text();
  const id = request.headers.get('svix-id');
  const timestamp = request.headers.get('svix-timestamp');
  const signature = request.headers.get('svix-signature');
  const secret = process.env.RESEND_WEBHOOK_SECRET;

  if (!secret) return NextResponse.json({ error: 'Webhook unavailable' }, { status: 503 });
  if (!id || !timestamp || !signature) {
    return NextResponse.json({ error: 'Missing webhook signature headers' }, { status: 400 });
  }

  let event: ResendWebhookEvent;
  try {
    event = new Webhook(secret).verify(payload, {
      'svix-id': id,
      'svix-timestamp': timestamp,
      'svix-signature': signature,
    }) as ResendWebhookEvent;
  } catch {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
  }

  if (!HANDLED.has(event.type)) return NextResponse.json({ received: true, ignored: true });

  const recipient = recipientOf(event);
  const occurredAt = event.created_at ? new Date(event.created_at) : new Date();

  try {
    await connectToDatabase();
    const created = await EmailProviderEvent.updateOne(
      { provider: 'resend', eventId: id },
      {
        $setOnInsert: {
          provider: 'resend',
          eventId: id,
          eventType: event.type,
          emailId: event.data?.email_id ?? null,
          recipient,
          occurredAt,
          receivedAt: new Date(),
        },
      },
      { upsert: true }
    );

    if (created.upsertedCount === 0) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    const reason = suppressionReason(event);
    if (reason && recipient) {
      await UserProfile.updateMany({ email: recipient }, { $set: suppressionPatch(reason, occurredAt) });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    reportOperationalError({
      category: 'server_error',
      name: 'resend_webhook_processing',
      route: '/api/webhooks/resend',
      metadata: { provider: 'resend', eventId: id, eventType: event.type },
    }, error);
    // Non-2xx makes Resend/Svix retry; event upsert makes retries idempotent.
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 503 });
  }
}
