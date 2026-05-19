import { stripe } from '@/lib/stripe';
import type { StripeUserMetadata } from '@/lib/stripe';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export type InvoiceResponse = {
  url: string | null;
  number: string | null;
  amountPaid: number | null;
  currency: string | null;
  date: number | null;
};

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ url: null }, { status: 401 });

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const meta = user.privateMetadata as Partial<StripeUserMetadata>;

  if (!meta.stripeSubscriptionId) {
    return NextResponse.json<InvoiceResponse>({
      url: null, number: null, amountPaid: null, currency: null, date: null,
    });
  }

  const { data: invoices } = await stripe.invoices.list({
    subscription: meta.stripeSubscriptionId,
    limit: 1,
  });

  if (invoices.length === 0) {
    return NextResponse.json<InvoiceResponse>({
      url: null, number: null, amountPaid: null, currency: null, date: null,
    });
  }

  const inv = invoices[0];
  return NextResponse.json<InvoiceResponse>({
    url: inv.invoice_pdf ?? null,
    number: inv.number ?? null,
    amountPaid: inv.amount_paid,
    currency: inv.currency,
    date: inv.created,
  });
}
