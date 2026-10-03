import { SUBSCRIPTION_CATALOG } from '@/lib/commercial-pricing';

/**
 * Catálogo canónico de planes de Prompt Studio.
 *
 * Los precios y créditos proceden de commercial-pricing.ts, la fuente de verdad
 * para /prices, grants de suscripción y validaciones del producto.
 *
 * - Free:    $0/mes  ·     0 Prompt Credits
 * - Premium: $9/mes  ·   500 Prompt Credits
 * - Creator: $19/mes · 1,000 Prompt Credits
 * - Pro:     $29/mes · 1,500 Prompt Credits
 * - Studio:  $39/mes · 3,000 Prompt Credits
 *
 * La facturación anual conserva 12 meses de créditos. Los Founder Credits y
 * las recargas son productos distintos y no deben alterar este catálogo.
 */
export type PlanId = 'free' | 'premium' | 'creator' | 'pro' | 'studio';
export type BillingCycle = 'monthly' | 'annual';

export const PLAN_PRICES = {
  premium: { monthly: SUBSCRIPTION_CATALOG.premium.monthlyPriceUsd, annual: SUBSCRIPTION_CATALOG.premium.annualPriceUsd },
  creator: { monthly: SUBSCRIPTION_CATALOG.creator.monthlyPriceUsd, annual: SUBSCRIPTION_CATALOG.creator.annualPriceUsd },
  pro: { monthly: SUBSCRIPTION_CATALOG.pro.monthlyPriceUsd, annual: SUBSCRIPTION_CATALOG.pro.annualPriceUsd },
  studio: { monthly: SUBSCRIPTION_CATALOG.studio.monthlyPriceUsd, annual: SUBSCRIPTION_CATALOG.studio.annualPriceUsd },
} as const;

export const PLAN_MONTHLY_CREDITS = {
  premium: SUBSCRIPTION_CATALOG.premium.monthlyCredits,
  creator: SUBSCRIPTION_CATALOG.creator.monthlyCredits,
  pro: SUBSCRIPTION_CATALOG.pro.monthlyCredits,
  studio: SUBSCRIPTION_CATALOG.studio.monthlyCredits,
} as const;

/**
 * Kept as part of the public pricing API because /prices renders a breakdown.
 * Subscription plans currently have no bonus-credit multiplier.
 */
export const PLAN_BONUS_PERCENT = {
  premium: { monthly: 0, annual: 0 },
  creator: { monthly: 0, annual: 0 },
  pro: { monthly: 0, annual: 0 },
  studio: { monthly: 0, annual: 0 },
} as const;

const PLAN_RANK: Record<PlanId, number> = {
  free: 0, premium: 1, creator: 2, pro: 3, studio: 4,
};

export function planAtLeast(plan: PlanId, required: PlanId): boolean {
  return PLAN_RANK[plan] >= PLAN_RANK[required];
}

export function normalizeExistingPlan(plan: string): PlanId {
  if (plan === 'startup') return 'studio';
  if (plan === 'basic') return 'premium';
  if (plan === 'premium' || plan === 'creator' || plan === 'pro' || plan === 'studio' || plan === 'free') return plan;
  return 'free';
}

export function getPlanPrice(plan: PlanId, cycle: BillingCycle): number {
  if (plan === 'free') return 0;
  return PLAN_PRICES[plan][cycle];
}

export function getPlanBaseCredits(plan: PlanId, cycle: BillingCycle = 'monthly'): number {
  if (plan === 'free') return 0;
  const monthly = PLAN_MONTHLY_CREDITS[plan];
  return cycle === 'annual' ? monthly * 12 : monthly;
}

export function getPlanBonusPercent(plan: PlanId, cycle: BillingCycle = 'monthly'): number {
  if (plan === 'free') return 0;
  return PLAN_BONUS_PERCENT[plan][cycle];
}

export function getPlanBonusCredits(plan: PlanId, cycle: BillingCycle = 'monthly'): number {
  const base = getPlanBaseCredits(plan, cycle);
  return Math.floor(base * getPlanBonusPercent(plan, cycle) / 100);
}

export function getPlanCredits(plan: PlanId, cycle: BillingCycle = 'monthly'): number {
  return getPlanBaseCredits(plan, cycle) + getPlanBonusCredits(plan, cycle);
}

export function formatPlanAmount(amount: number, cycle: BillingCycle): string {
  if (amount === 0) return '$0';
  return `$${amount}${cycle === 'annual' ? '/year' : '/month'}`;
}

export function getNextBillingDate(cycle: BillingCycle): Date {
  const date = new Date();
  if (cycle === 'annual') date.setFullYear(date.getFullYear() + 1);
  else date.setMonth(date.getMonth() + 1);
  return date;
}
