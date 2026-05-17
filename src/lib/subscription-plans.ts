export type PlanId = 'free' | 'premium' | 'startup';
export type BillingCycle = 'monthly' | 'annual';

export const PLAN_PRICES = {
  premium: { monthly: 10, annual: 99 },
  startup: { monthly: 15, annual: 150 },
} as const;

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
