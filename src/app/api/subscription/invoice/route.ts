import { stripe } from '@/lib/stripe';
import type { StripeUserMetadata } from '@/lib/stripe';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';

export type InvoiceResponse = {
  url: string | null;
  number: string | null;
  amountPaid: number | null;
  currency: string | null;
  date: number | null;
};

function invoiceResponse<T>(body: T, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: cacheHeaders('private-no-store'),
  });
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return invoiceResponse({ url: null }, 401);

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const meta = user.privateMetadata as Partial<StripeUserMetadata>;

  if (!meta.stripeSubscriptionId) {
    return invoiceResponse<InvoiceResponse>({
      url: null, number: null, amountPaid: null, currency: null, date: null,
    });
  }

  const { data: invoices } = await stripe.invoices.list({
    subscription: meta.stripeSubscriptionId,
    limit: 1,
  });

  if (invoices.length === 0) {
    return invoiceResponse<InvoiceResponse>({
      url: null, number: null, amountPaid: null, currency: null, date: null,
    });
  }

  const inv = invoices[0];
  return invoiceResponse<InvoiceResponse>({
    url: inv.invoice_pdf ?? null,
    number: inv.number ?? null,
    amountPaid: inv.amount_paid,
    currency: inv.currency,
    date: inv.created,
  });
}
