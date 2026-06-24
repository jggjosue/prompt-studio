import { stripe, extractSubscriptionMeta, type StripeUserMetadata } from '@/lib/stripe';
import { clerkClient } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import type Stripe from 'stripe';

async function updateUserSubscription(
  clerkUserId: string,
  subscription: Stripe.Subscription,
  stripeCustomerId: string
) {
  const client = await clerkClient();
  const plan = (subscription.metadata?.plan as 'premium' | 'startup') ?? 'premium';
  await client.users.updateUserMetadata(clerkUserId, {
    privateMetadata: extractSubscriptionMeta(subscription, stripeCustomerId, plan),
  });
}

async function getClerkUserIdFromCustomer(customerId: string): Promise<string | null> {
  const customer = await stripe.customers.retrieve(customerId);
  if (customer.deleted) return null;
  return (customer.metadata?.clerkUserId as string) ?? null;
}

export async function POST(req: Request) {
  const body = await req.text();
  const sig = (await headers()).get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const clientRef = session.client_reference_id;
        const customerId = session.customer as string;

        if (session.mode === 'payment' && clientRef) {
          // One-time purchase
          const [clerkUserId, pageId] = clientRef.split('___');
          if (clerkUserId && pageId) {
            const client = await clerkClient();
            const user = await client.users.getUser(clerkUserId);
            const meta = (user.privateMetadata || {}) as Partial<StripeUserMetadata> & { purchasedPages?: string[] };
            const purchasedPages = Array.isArray(meta.purchasedPages) ? [...meta.purchasedPages] : [];
            
            if (!purchasedPages.includes(pageId)) {
              purchasedPages.push(pageId);
              await client.users.updateUserMetadata(clerkUserId, {
                privateMetadata: {
                  ...meta,
                  purchasedPages,
                },
              });
            }
            
            if (customerId && !meta.stripeCustomerId) {
              await stripe.customers.update(customerId, {
                metadata: { clerkUserId },
              });
            }
          }
          break;
        }

        const clerkUserId = clientRef;
        const subscriptionId = session.subscription as string;

        if (!clerkUserId || !customerId || !subscriptionId) break;

        // Tag the Stripe customer with the Clerk user ID for future events
        await stripe.customers.update(customerId, {
          metadata: { clerkUserId },
        });

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await updateUserSubscription(clerkUserId, subscription, customerId);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const clerkUserId = await getClerkUserIdFromCustomer(customerId);
        if (!clerkUserId) break;
        await updateUserSubscription(clerkUserId, subscription, customerId);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const clerkUserId = await getClerkUserIdFromCustomer(customerId);
        if (!clerkUserId) break;
        await updateUserSubscription(clerkUserId, subscription, customerId);
        break;
      }
    }
  } catch (err) {
    console.error('Stripe webhook handler error:', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
