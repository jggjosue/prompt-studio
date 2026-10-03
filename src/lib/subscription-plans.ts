/**
 * Jerarquía de planes, de menor a mayor:
 * free < premium < creator < pro < studio.
 *
 * Créditos por ciclo mensual (regla: 1 Prompt Credit = $0.01 USD):
 * - Free:    $0/mes  ·     0 Prompt Credits
 * - Premium: $9/mes  ·   900 Prompt Credits  ($9 × 100)
 * - Creator: $19/mes · 1,900 Prompt Credits  ($19 × 100)
 * - Pro:     $29/mes · 2,900 Prompt Credits  ($29 × 100)
 * - Studio:  $39/mes · 3,900 Prompt Credits  ($39 × 100)
 *
 * En facturación anual el suscriptor paga el precio anual y recibe
 * 12× los créditos mensuales en el ciclo (ahorro del ~17%).
 * Ejemplo Premium anual: $90/año → 10.800 cr (≡ $0.0083/cr, mejor que mensual).
 */
export type PlanId = 'free' | 'premium' | 'creator' | 'pro' | 'studio';
export type BillingCycle = 'monthly' | 'annual';

export const PLAN_PRICES = {
  premium: { monthly: 9, annual: 90 },
  creator: { monthly: 19, annual: 190 },
  pro: { monthly: 29, annual: 290 },
  studio: { monthly: 39, annual: 390 },
} as const;

export const PLAN_MONTHLY_CREDITS = {
  premium: 900,   // $9  × 100 = 900 cr
  creator: 1900,  // $19 × 100 = 1.900 cr
  pro: 2900,      // $29 × 100 = 2.900 cr
  studio: 3900,   // $39 × 100 = 3.900 cr
} as const;

const PLAN_RANK: Record<PlanId, number> = {
  free: 0,
  premium: 1,
  creator: 2,
  pro: 3,
  studio: 4,
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

export function getPlanCredits(plan: PlanId, cycle: BillingCycle = 'monthly'): number {
  if (plan === 'free') return 0;
  const monthly = PLAN_MONTHLY_CREDITS[plan];
  return cycle === 'annual' ? monthly * 12 : monthly;
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
