/**
 * Jerarquía de planes, de menor a mayor: `free` < `creator` < `pro` < `studio`.
 *
 * Precios (créditos mensuales incluidos):
 * - Free: $0 / 1 crédito inicial
 * - Creator: $9/mes · 250 créditos
 * - Pro: $19/mes · 1,000 créditos (Más Popular)
 * - Studio: $39/mes · 3,000 créditos
 *
 * El plan `creator` reemplaza al antiguo `premium` (mismo precio, renombrado).
 * El plan `studio` reemplaza al antiguo `startup`.
 * Los suscriptores existentes con `stripePlan: 'premium'` se mapean a `creator`
 * automáticamente mediante `normalizeExistingPlan()`.
 */
export type PlanId = 'free' | 'creator' | 'pro' | 'studio';
export type BillingCycle = 'monthly' | 'annual';

export const PLAN_PRICES = {
  creator: { monthly: 9, annual: 90 },
  pro: { monthly: 19, annual: 190 },
  studio: { monthly: 39, annual: 390 },
} as const;

export const PLAN_CREDITS = {
  creator: 250,
  pro: 1000,
  studio: 3000,
} as const;

const PLAN_RANK: Record<PlanId, number> = { free: 0, creator: 1, pro: 2, studio: 3 };

export function planAtLeast(plan: PlanId, required: PlanId): boolean {
  return PLAN_RANK[plan] >= PLAN_RANK[required];
}

/**
 * Mapea planes legacy (`premium`, `startup`) a los nuevos nombres.
 * Esto preserva el acceso de suscriptores existentes.
 */
export function normalizeExistingPlan(plan: string): PlanId {
  if (plan === 'premium') return 'creator';
  if (plan === 'startup') return 'studio';
  return plan as PlanId;
}

export function getPlanPrice(plan: PlanId, cycle: BillingCycle): number {
  if (plan === 'free') return 0;
  return PLAN_PRICES[plan][cycle === 'annual' ? 'annual' : 'monthly'];
}

export function getPlanCredits(plan: PlanId): number {
  if (plan === 'free') return 1;
  return PLAN_CREDITS[plan];
}

export function formatPlanAmount(amount: number, cycle: BillingCycle): string {
  if (amount === 0) return '$0';
  const suffix = cycle === 'annual' ? '/year' : '/month';
  return `$${amount}${suffix}`;
}

export function getNextBillingDate(cycle: BillingCycle): Date {
  const date = new Date();
  if (cycle === 'annual') {
    date.setFullYear(date.getFullYear() + 1);
  } else {
    date.setMonth(date.getMonth() + 1);
  }
  return date;
}
