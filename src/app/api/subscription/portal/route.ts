import { stripe } from '@/lib/stripe';
import type { StripeUserMetadata } from '@/lib/stripe';
import { getSiteUrl } from '@/lib/site-url';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';

export async function POST(req: Request) {
  const headers = cacheHeaders('private-no-store');
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse('Unauthorized', { status: 401, headers });

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const meta = user.privateMetadata as Partial<StripeUserMetadata>;

    if (!meta.stripeCustomerId) {
      return new NextResponse('No stripe customer ID found', { status: 400, headers });
    }

    const body = await req.json().catch(() => ({}));
    const returnUrl =
      body.returnUrl ||
      `${req.headers.get('origin') || getSiteUrl()}/dashboard/profile`;

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: meta.stripeCustomerId,
      return_url: returnUrl,
    });

    return NextResponse.json({ url: portalSession.url }, { headers });
  } catch (error) {
    console.error('Stripe portal error:', error);
    return new NextResponse('Internal error', { status: 500, headers });
  }
}
