import { stripe } from '@/lib/stripe';
import type { StripeUserMetadata } from '@/lib/stripe';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse('Unauthorized', { status: 401 });

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const meta = user.privateMetadata as Partial<StripeUserMetadata>;

    if (!meta.stripeCustomerId) {
      return new NextResponse('No stripe customer ID found', { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const returnUrl = body.returnUrl || `${req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'process.env.DOMAIN_DEV'}/dashboard/profile`;

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: meta.stripeCustomerId,
      return_url: returnUrl,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('Stripe portal error:', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
