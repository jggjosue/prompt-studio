import { isPremiumJoAdmin } from '@/lib/admin-auth';
import connectToDatabase from '@/lib/mongoose';
import AffiliateSale from '@/models/AffiliateSale';
import { redirect } from 'next/navigation';

function money(cents: number, currency = 'USD') {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export default async function AdminAffiliateSalesPage() {
  if (!(await isPremiumJoAdmin())) {
    redirect('/dashboard/profile');
  }

  await connectToDatabase();

  const sales = await AffiliateSale.find({}).sort({ createdAt: -1 }).limit(500).lean();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Affiliate sales admin</h1>
        <p className="text-sm text-muted-foreground">
          Visible solo para <code>PROMPT_STUDIO_PREMIUM_JO</code>.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Buyer</th>
                <th className="px-4 py-3 font-medium">Referrer</th>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Commission</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Stripe Ref</th>
              </tr>
            </thead>
            <tbody>
              {sales.map(sale => (
                <tr key={`${sale.stripeCheckoutSessionId ?? sale.stripeInvoiceId ?? sale._id.toString()}`} className="border-b last:border-b-0">
                  <td className="px-4 py-3 whitespace-nowrap">{new Date(sale.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3 font-mono text-xs">{sale.buyerUserId}</td>
                  <td className="px-4 py-3 font-mono text-xs">{sale.referrerUserId}</td>
                  <td className="px-4 py-3">{sale.productName}</td>
                  <td className="px-4 py-3 capitalize">{sale.source}</td>
                  <td className="px-4 py-3">{money(sale.amountPaidCents, sale.currency)}</td>
                  <td className="px-4 py-3">{money(sale.commissionCents, sale.currency)}</td>
                  <td className="px-4 py-3 capitalize">{sale.status}</td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {sale.stripeCheckoutSessionId || sale.stripeInvoiceId || sale.stripeSubscriptionId || sale.stripeCustomerId || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
