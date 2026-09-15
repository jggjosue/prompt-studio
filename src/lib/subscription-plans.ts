/**
 * Jerarquía de planes, de menor a mayor: `free` < `premium` < `pro` < `startup`.
 *
 * `pro` es el tramo intermedio. Se diferencia por **publicar en dominio propio**
 * y por los brand kits, no por créditos: no existe ningún mecanismo que conceda
 * créditos por plan —ni mensual ni al renovar—, así que un tramo vendido por
 * créditos no podría entregar nada. Ver `docs/marketing.md`.
 */
export type PlanId = 'free' | 'premium' | 'pro' | 'startup';
export type BillingCycle = 'monthly' | 'annual';

export const PLAN_PRICES = {
  premium: { monthly: 9, annual: 54 },
  pro: { monthly: 39, annual: 390 },
  startup: { monthly: 1000, annual: 10000 },
} as const;

/**
 * Orden para comparar planes. Evita cadenas de `||` que se olvidan al añadir un
 * tramo, que es justo lo que hacía falta tocar en ocho sitios distintos.
 */
const PLAN_RANK: Record<PlanId, number> = { free: 0, premium: 1, pro: 2, startup: 3 };

/** `true` si `plan` cubre al menos lo que exige `required`. */
export function planAtLeast(plan: PlanId, required: PlanId): boolean {
  return PLAN_RANK[plan] >= PLAN_RANK[required];
}

export function getPlanPrice(plan: PlanId, cycle: BillingCycle): number {
  if (plan === 'free') return 0;
  return PLAN_PRICES[plan][cycle === 'annual' ? 'annual' : 'monthly'];
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
