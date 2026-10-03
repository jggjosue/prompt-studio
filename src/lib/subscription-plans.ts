/**
 * Jerarquía de planes, de menor a mayor:
 * free < premium < creator < pro < studio.
 *
 * Créditos por ciclo mensual:
 * - Free: 0 créditos de IA durante la campaña
 * - Premium: $9/mes · 500 Prompt Credits
 * - Creator: $19/mes · 1,000 Prompt Credits
 * - Pro: $25/mes · 1,500 Prompt Credits
 * - Studio: $39/mes · 3,000 Prompt Credits
 *
 * En facturación anual se conceden 12× los créditos mensuales en el ciclo anual.
 * La economía comercial mantiene un valor de referencia >= $0.01 por crédito.
 */
export type PlanId = 'free' | 'premium' | 'creator' | 'pro' | 'studio';
export type BillingCycle = 'monthly' | 'annual';

export const PLAN_PRICES = {
  premium: { monthly: 9, annual: 90 },
  creator: { monthly: 19, annual: 190 },
  pro: { monthly: 25, annual: 250 },
  studio: { monthly: 39, annual: 390 },
} as const;

export const PLAN_MONTHLY_CREDITS = {
  premium: 500,
  creator: 1000,
  pro: 1500,
  studio: 3000,
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
