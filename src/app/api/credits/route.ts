import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';
import { getCreditBalance } from '@/lib/ai-job-service';
import { centsPerCredit, CREDIT_PACKS, formatCreditPackPrice } from '@/lib/credit-packs';
import { listCreditPurchases } from '@/lib/credit-topup';

/** Saldo, packs disponibles e historial de recargas del usuario. */
export async function GET() {
  const headers = cacheHeaders('private-no-store');
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'No autorizado.' }, { status: 401, headers });

  const [credits, purchases] = await Promise.all([
    getCreditBalance(userId),
    listCreditPurchases(userId),
  ]);

  const baseRate = centsPerCredit(CREDIT_PACKS[0]);
  const packs = CREDIT_PACKS.map(pack => ({
    id: pack.id,
    name: pack.name.es,
    description: pack.description.es,
    credits: pack.credits,
    bonusCredits: pack.bonusCredits,
    price: formatCreditPackPrice(pack),
    currency: pack.currency,
    featured: Boolean(pack.featured),
    /** Ahorro porcentual por crédito frente al pack más pequeño. */
    savingsPercent: Math.round((1 - centsPerCredit(pack) / baseRate) * 100),
  }));

  // Credits temporarily disabled — force balance to 0 for all users
  const creditsWithZeroBalance = { ...credits, balance: 0 };

  return NextResponse.json({ credits: creditsWithZeroBalance, packs, purchases }, { headers });
}
