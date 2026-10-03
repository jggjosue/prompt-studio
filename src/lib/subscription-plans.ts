/**
 * Jerarquía de planes, de menor a mayor:
 * free < premium < creator < pro < studio.
 *
 * Créditos por ciclo mensual (regla: 1 Prompt Credit = $0.01 USD):
 * - Free:    $0/mes  ·     0 Prompt Credits
 * - Premium: $9/mes  ·   900 cr base + 5%  bonus = 945 cr efectivos
 * - Creator: $19/mes · 1,900 cr base + 7%  bonus = 2,033 cr efectivos
 * - Pro:     $29/mes · 2,900 cr base + 10% bonus = 3,190 cr efectivos
 * - Studio:  $39/mes · 3,900 cr base + 12% bonus = 4,368 cr efectivos
 *
 * Los porcentajes de bonus mensual corresponden al tier de crowdfunding más
 * cercano por precio: Premium≈$10 (5%), Creator≈$25 (7%), Pro≈$50 (10%), Studio≈$100 (12%).
 *
 * En facturación anual el suscriptor paga por adelantado un monto mayor,
 * por lo que recibe un tier de bonus superior (igual que en crowdfunding):
 * - Premium  $90/año  → tier $100  → 12% bonus → 10,800 + 1,296 = 12,096 cr
 * - Creator  $190/año → tier $250  → 15% bonus → 22,800 + 3,420 = 26,220 cr
 * - Pro      $290/año → tier $500  → 17% bonus → 34,800 + 5,916 = 40,716 cr
 * - Studio   $390/año → tier $1000 → 20% bonus → 46,800 + 9,360 = 56,160 cr
 *
 * ┌─────────┬──────────┬──────────┬───────┬────────────┬──────────────┐
 * │ Plan    │ Precio   │ Base cr  │ Bonus │ Bonus cr   │ Total cr     │
 * ├─────────┼──────────┼──────────┼───────┼────────────┼──────────────┤
 * │ Premium │ $9/mes   │   900    │  5%   │   +45      │    945 /mes  │
 * │ Creator │ $19/mes  │  1.900   │  7%   │  +133      │  2.033 /mes  │
 * │ Pro     │ $29/mes  │  2.900   │ 10%   │  +290      │  3.190 /mes  │
 * │ Studio  │ $39/mes  │  3.900   │ 12%   │  +468      │  4.368 /mes  │
 * ├─────────┼──────────┼──────────┼───────┼────────────┼──────────────┤
 * │ Premium │ $90/año  │ 10.800   │ 12%   │ +1.296     │ 12.096 /año  │
 * │ Creator │ $190/año │ 22.800   │ 15%   │ +3.420     │ 26.220 /año  │
 * │ Pro     │ $290/año │ 34.800   │ 17%   │ +5.916     │ 40.716 /año  │
 * │ Studio  │ $390/año │ 46.800   │ 20%   │ +9.360     │ 56.160 /año  │
 * └─────────┴──────────┴──────────┴───────┴────────────┴──────────────┘
 */
export type PlanId = 'free' | 'premium' | 'creator' | 'pro' | 'studio';
export type BillingCycle = 'monthly' | 'annual';

export const PLAN_PRICES = {
  premium: { monthly: 9, annual: 90 },
  creator: { monthly: 19, annual: 190 },
  pro:     { monthly: 29, annual: 290 },
  studio:  { monthly: 39, annual: 390 },
} as const;

export const PLAN_MONTHLY_CREDITS = {
  premium: 900,   // $9  × 100 = 900 cr
  creator: 1900,  // $19 × 100 = 1.900 cr
  pro:     2900,  // $29 × 100 = 2.900 cr
  studio:  3900,  // $39 × 100 = 3.900 cr
} as const;

/**
 * Bonus porcentual por ciclo de suscripción.
 * Escala proporcional al sistema de crowdfunding/top-ups:
 * mensual usa el tier equivalente al precio del plan;
 * anual sube un tier porque el pago es mayor y adelantado.
 */
export const PLAN_BONUS_PERCENT = {
  premium: { monthly: 5,  annual: 12 },
  creator: { monthly: 7,  annual: 15 },
  pro:     { monthly: 10, annual: 17 },
  studio:  { monthly: 12, annual: 20 },
} as const;

const PLAN_RANK: Record<PlanId, number> = {
  free: 0, premium: 1, creator: 2, pro: 3, studio: 4,
};

export function planAtLeast(plan: PlanId, required: PlanId): boolean {
  return PLAN_RANK[plan] >= PLAN_RANK[required];
}

/**
 * Conserva aliases históricos que siguen apareciendo en metadata antigua.
 */
export function normalizeExistingPlan(plan: string): PlanId {
  if (plan === 'startup') return 'studio';
  if (plan === 'basic') return 'premium';
  if (plan === 'premium' || plan === 'creator' || plan === 'pro' || plan === 'studio' || plan === 'free') {
    return plan;
  }
  return 'free';
}

export function getPlanPrice(plan: PlanId, cycle: BillingCycle): number {
  if (plan === 'free') return 0;
  return PLAN_PRICES[plan][cycle];
}

/** Base credits (before bonus) for the given plan/cycle. */
export function getPlanBaseCredits(plan: PlanId, cycle: BillingCycle = 'monthly'): number {
  if (plan === 'free') return 0;
  const monthly = PLAN_MONTHLY_CREDITS[plan];
  return cycle === 'annual' ? monthly * 12 : monthly;
}

/** Bonus percent that applies to this plan/cycle. */
export function getPlanBonusPercent(plan: PlanId, cycle: BillingCycle = 'monthly'): number {
  if (plan === 'free') return 0;
  return PLAN_BONUS_PERCENT[plan][cycle];
}

/** Bonus credit count (floor) for the given plan/cycle. */
export function getPlanBonusCredits(plan: PlanId, cycle: BillingCycle = 'monthly'): number {
  const base = getPlanBaseCredits(plan, cycle);
  const pct = getPlanBonusPercent(plan, cycle);
  return Math.floor(base * pct / 100);
}

/**
 * Total effective credits (base + bonus) for the given plan/cycle.
 * Use this wherever the user sees their total credit balance.
 */
export function getPlanCredits(plan: PlanId, cycle: BillingCycle = 'monthly'): number {
  return getPlanBaseCredits(plan, cycle) + getPlanBonusCredits(plan, cycle);
}

export function formatPlanAmount(amount: number, cycle: BillingCycle): string {
  if (amount === 0) return '$0';
  const suffix = cycle === 'annual' ? '/year' : '/month';
  return `$${amount}${suffix}`;
}

export function getNextBillingDate(cycle: BillingCycle): Date {
  const date = new Date();
  if (cycle === 'annual') date.setFullYear(date.getFullYear() + 1);
  else date.setMonth(date.getMonth() + 1);
  return date;
}
