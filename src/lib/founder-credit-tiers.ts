import { validateCreditSaleEconomics } from '@/lib/credit-economics';
import { FOUNDER_BASE_CREDITS_PER_USD, FOUNDER_REWARD_CATALOG } from '@/lib/commercial-pricing';

export { FOUNDER_BASE_CREDITS_PER_USD } from '@/lib/commercial-pricing';

/**
 * Regla de economía del Crowdfunding de Prompt Studio.
 *
 * Founder usa una conversión promocional separada: 80 créditos base por USD aportado.
 * El bonus por tier se aplica después sobre esos créditos base.
 *
 * Se valida el margen sólo sobre los créditos BASE para que los bonus
 * (incentivos de volumen) puedan exceder el piso sin bloquear la operación.
 * Los bonus se financian con el margen de ganancia disponible (~50%).
 *
 * ┌──────────────┬───────────┬───────┬──────────────────┐
 * │ Aportación   │ Base cr   │ Bonus │ Total Founder cr  │
 * ├──────────────┼───────────┼───────┼──────────────────┤
 * │ $10          │   800     │  5%   │   840            │
 * │ $25          │ 2.000     │  7%   │ 2.140            │
 * │ $50          │ 4.000     │ 10%   │ 4.400            │
 * │ $100         │ 8.000     │ 12%   │ 8.960            │
 * │ $250         │20.000     │ 15%   │23.000            │
 * │ $500         │40.000     │ 17%   │46.800            │
 * │ $1.000       │80.000     │ 20%   │96.000            │
 * └──────────────┴───────────┴───────┴──────────────────┘
 *
 * Peor caso de ganancia (aportación $1.000, bonus 20%):
 *   Ingreso:             $1.000
 *   Total cr entregados: 96.000
 *   Costo IA máx (25%):  $240
 *   Plataforma (15%):    $150  (approx)
 *   Stripe/riesgo (10%): $100
 *   Ganancia neta mín:   ~$450 (~45%)
 */
export const FOUNDER_REWARD_TIERS = FOUNDER_REWARD_CATALOG;

export const MIN_FOUNDER_PLEDGE_CENTS = 1000;
export const MAX_FOUNDER_PLEDGE_CENTS = 1_000_000;

export function getFounderRewardTier(pledgeAmountCents: number) {
  if (!Number.isInteger(pledgeAmountCents) || pledgeAmountCents < MIN_FOUNDER_PLEDGE_CENTS || pledgeAmountCents > MAX_FOUNDER_PLEDGE_CENTS) {
    return null;
  }

  const matched = [...FOUNDER_REWARD_TIERS]
    .reverse()
    .find((candidate) => pledgeAmountCents >= candidate.pledgeAmountCents);

  if (!matched) return null;

  const baseCredits = Math.floor((pledgeAmountCents / 100) * FOUNDER_BASE_CREDITS_PER_USD);
  const bonusCredits = Math.floor(baseCredits * matched.bonusPercent / 100);
  const totalCredits = baseCredits + bonusCredits;
  if (!validateCreditSaleEconomics({ priceCents: pledgeAmountCents, credits: baseCredits }).eligible) {
    return null;
  }
  return {
    pledgeAmountCents,
    baseCredits,
    bonusPercent: matched.bonusPercent,
    bonusCredits,
    totalCredits,
    rewardTier: `founder-${matched.pledgeAmountCents}-plus`,
  };
}
