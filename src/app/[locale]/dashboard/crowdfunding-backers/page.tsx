import { redirect } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { isPremiumJoAdmin } from '@/lib/admin-auth';
import { FOUNDER_CROWDFUNDING_CAMPAIGN_ID } from '@/lib/crowdfunding-campaign-config';
import connectToDatabase from '@/lib/mongoose';
import CrowdfundingBacker from '@/models/CrowdfundingBacker';

export const dynamic = 'force-dynamic';

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const number = new Intl.NumberFormat('en-US');

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'claimed') return 'default';
  if (status === 'eligible') return 'secondary';
  if (status === 'cancelled') return 'destructive';
  return 'outline';
}

export default async function DashboardCrowdfundingBackersPage() {
  if (!(await isPremiumJoAdmin())) {
    redirect('/dashboard/profile');
  }

  await connectToDatabase();
  const backers = await CrowdfundingBacker.find({
    campaignId: FOUNDER_CROWDFUNDING_CAMPAIGN_ID,
  })
    .sort({ backerNumber: 1 })
    .limit(5000)
    .lean();

  const totals = backers.reduce(
    (acc, backer) => {
      acc.contributedCents += backer.totalContributedCents;
      acc.credits += backer.totalCredits;
      acc.contributions += backer.contributionCount;
      return acc;
    },
    { contributedCents: 0, credits: 0, contributions: 0 },
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-500">
          Superadministrador
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Backers de Crowdfunding</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Registro privado en orden de aportación para controlar pagos, Founder Credits y fulfillment.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border bg-card px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Backers únicos</p>
          <p className="mt-1 text-2xl font-semibold">{number.format(backers.length)}</p>
        </div>
        <div className="rounded-xl border bg-card px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Aportes registrados</p>
          <p className="mt-1 text-2xl font-semibold">{number.format(totals.contributions)}</p>
        </div>
        <div className="rounded-xl border bg-card px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Recaudado</p>
          <p className="mt-1 text-2xl font-semibold">{currency.format(totals.contributedCents / 100)}</p>
        </div>
        <div className="rounded-xl border bg-card px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Founder Credits</p>
          <p className="mt-1 text-2xl font-semibold">{number.format(totals.credits)}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] text-sm">
            <thead className="border-b bg-muted/40 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Usuario / email</th>
                <th className="px-4 py-3 text-right font-medium">Aportado</th>
                <th className="px-4 py-3 text-right font-medium">Base</th>
                <th className="px-4 py-3 text-right font-medium">Bonus</th>
                <th className="px-4 py-3 text-right font-medium">Total créditos</th>
                <th className="px-4 py-3 text-right font-medium">Aportes</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Primer aporte</th>
                <th className="px-4 py-3 font-medium">Último aporte</th>
                <th className="px-4 py-3 font-medium">Claim</th>
              </tr>
            </thead>
            <tbody>
              {backers.length ? backers.map(backer => (
                <tr key={String(backer._id)} className="border-b last:border-b-0 align-top">
                  <td className="px-4 py-3 font-semibold text-blue-500">#{backer.backerNumber}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{backer.purchaserEmail || 'Email no disponible'}</div>
                    <div className="mt-1 max-w-64 break-all text-xs text-muted-foreground">
                      {backer.purchaserUserId || 'Sin Clerk user ID'}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {currency.format(backer.totalContributedCents / 100)}
                  </td>
                  <td className="px-4 py-3 text-right">{number.format(backer.totalBaseCredits)}</td>
                  <td className="px-4 py-3 text-right">{number.format(backer.totalBonusCredits)}</td>
                  <td className="px-4 py-3 text-right font-semibold">{number.format(backer.totalCredits)}</td>
                  <td className="px-4 py-3 text-right">{number.format(backer.contributionCount)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(backer.creditStatus)} className="capitalize">
                      {backer.creditStatus}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {new Date(backer.firstContributionAt).toLocaleString('es-MX')}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {new Date(backer.lastContributionAt).toLocaleString('es-MX')}
                  </td>
                  <td className="px-4 py-3">
                    <span className="block max-w-40 break-all text-xs text-muted-foreground">
                      {backer.founderClaimId ? String(backer.founderClaimId) : 'Pendiente'}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={11} className="px-4 py-10 text-center text-muted-foreground">
                    Todavía no hay backers registrados en esta campaña.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Esta tabla contiene información privada de pagos y usuarios. Solo se muestra al superadministrador.
        El orden #1, #2, #3… es el orden utilizado para el fulfillment de Founder Credits.
      </p>
    </div>
  );
}
