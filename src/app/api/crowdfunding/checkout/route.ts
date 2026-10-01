import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getSiteUrl } from '@/lib/site-url';
import { stripe } from '@/lib/stripe';

const TIERS = [
  { cents: 1000, bonus: 5 }, { cents: 2500, bonus: 7 }, { cents: 5000, bonus: 10 },
  { cents: 10000, bonus: 12 }, { cents: 25000, bonus: 15 }, { cents: 50000, bonus: 17 },
  { cents: 100000, bonus: 20 },
] as const;

export async function POST(request: Request) {
  try {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 });
  const body = await request.json().catch(() => null) as { amountCents?: unknown; locale?: unknown } | null;
  const amountCents = Number(body?.amountCents);
  if (!Number.isInteger(amountCents) || amountCents < 1000 || amountCents > 100000) return NextResponse.json({ error: 'Amount must be between $10 and $1,000 USD.' }, { status: 400 });
  const tier = [...TIERS].reverse().find(item => amountCents >= item.cents) ?? TIERS[0];
  const baseCredits = amountCents;
  const bonusCredits = Math.floor(baseCredits * tier.bonus / 100);
  const totalCredits = baseCredits + bonusCredits;
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const email = user.primaryEmailAddress?.emailAddress;
  if (!email) return NextResponse.json({ error: 'Primary email required.' }, { status: 400 });
  const locale = body?.locale === 'es' ? 'es' : 'en';
  const siteUrl = getSiteUrl().replace(/\/$/, '');
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: email,
    client_reference_id: userId,
    line_items: [{ quantity: 1, price_data: { currency: 'usd', unit_amount: amountCents, product_data: { name: 'Prompt Studio Crowdfunding', description: `${totalCredits.toLocaleString()} estimated Founder Credits` } } }],
    metadata: { purchaseType: 'founder_crowdfunding', purchaserUserId: userId, amountCents: String(amountCents), baseCredits: String(baseCredits), bonusPercent: String(tier.bonus), bonusCredits: String(bonusCredits), totalCredits: String(totalCredits), fulfillmentStatus: 'pending_campaign_success' },
    payment_intent_data: { metadata: { purchaseType: 'founder_crowdfunding', purchaserUserId: userId } },
    success_url: `${siteUrl}/${locale}/founder?support=success`,
    cancel_url: `${siteUrl}/${locale}/founder?support=cancelled`,
  });
  if (!session.url) return NextResponse.json({ error: 'Stripe checkout is temporarily unavailable. Please try again.' }, { status: 502 });
  return NextResponse.json({ url: session.url });
  } catch (error) {
    // Keep provider details and credentials out of the public response.
    console.error('[crowdfunding/checkout] Checkout creation failed', {
      type: error instanceof Error ? error.name : 'UnknownError',
    });
    return NextResponse.json({ error: 'Checkout is temporarily unavailable. Please try again.' }, { status: 503 });
  }
}
