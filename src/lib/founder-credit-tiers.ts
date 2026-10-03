import { validateCreditSaleEconomics } from '@/lib/credit-economics';

export const FOUNDER_BASE_CREDITS_PER_USD = 100;

/**
 * Regla de economía del Crowdfunding de Prompt Studio.
 *
 * 1 Prompt Credit = $0.01 USD (piso comercial del sistema).
 * Por lo tanto: FOUNDER_BASE_CREDITS_PER_USD = 100 (precio × 100 = créditos base).
 *
 * Se valida el margen sólo sobre los créditos BASE para que los bonus
 * (incentivos de volumen) puedan exceder el piso sin bloquear la operación.
 * Los bonus se financian con el margen de ganancia disponible (~50%).
 *
 * ┌──────────────┬───────────┬───────┬──────────────────┐
 * │ Aportación   │ Base cr   │ Bonus │ Total Founder cr  │
 * ├──────────────┼───────────┼───────┼──────────────────┤
 * │ $10          │ 1.000     │  5%   │ 1.050            │
 * │ $25          │ 2.500     │  7%   │ 2.675            │
 * │ $50          │ 5.000     │ 10%   │ 5.500            │
 * │ $100         │ 10.000    │ 12%   │ 11.200           │
 * │ $250         │ 25.000    │ 15%   │ 28.750           │
 * │ $500         │ 50.000    │ 17%   │ 58.500           │
 * │ $1.000       │ 100.000   │ 20%   │ 120.000          │
 * └──────────────┴───────────┴───────┴──────────────────┘
 *
 * Peor caso de ganancia (aportación $1.000, bonus 20%):
 *   Ingreso:             $1.000
 *   Total cr entregados: 120.000
 *   Costo IA máx (25%):  $300
 *   Plataforma (15%):    $150  (approx)
 *   Stripe/riesgo (10%): $100
 *   Ganancia neta mín:   ~$450 (~45%)
 */
export const FOUNDER_REWARD_TIERS = [
  { pledgeAmountCents: 1000, bonusPercent: 5 },
  { pledgeAmountCents: 2500, bonusPercent: 7 },
  { pledgeAmountCents: 5000, bonusPercent: 10 },
  { pledgeAmountCents: 10000, bonusPercent: 12 },
  { pledgeAmountCents: 25000, bonusPercent: 15 },
  { pledgeAmountCents: 50000, bonusPercent: 17 },
  { pledgeAmountCents: 100000, bonusPercent: 20 },
] as const;

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
