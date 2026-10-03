import {
  MIN_EFFECTIVE_CREDIT_PRICE_USD,
  PROMPT_CREDIT_RETAIL_USD,
} from '@/lib/commercial-pricing';

/**
 * Economía central de Prompt Credits.
 *
 * - Valor nominal retail: $0.01 por crédito.
 * - Presupuesto máximo de proveedor IA: $0.0025 por crédito (25% del nominal).
 * - Infraestructura/operación: 15% del nominal.
 * - Pagos/refunds/riesgo: 10% del ingreso efectivo.
 *
 * Founder y anual pueden bajar el precio efectivo hasta el piso promocional
 * compartido ($0.01 / 1.20), pero nunca cambian el valor nominal del crédito.
 */
export const PROMPT_CREDIT_FLOOR_VALUE_USD = PROMPT_CREDIT_RETAIL_USD;
export const PROMPT_CREDIT_MIN_EFFECTIVE_SALE_USD = MIN_EFFECTIVE_CREDIT_PRICE_USD;
export const PROVIDER_COST_RESERVE_PERCENT = 25;
export const PLATFORM_OVERHEAD_RESERVE_PERCENT = 15;
export const PAYMENT_AND_RISK_RESERVE_PERCENT = 10;
export const TARGET_CONTRIBUTION_MARGIN_PERCENT = 50;
export const MIN_PROMOTIONAL_CONTRIBUTION_MARGIN_PERCENT = 40;

export const MAX_PROVIDER_COST_PER_CREDIT_USD =
  PROMPT_CREDIT_RETAIL_USD * (PROVIDER_COST_RESERVE_PERCENT / 100);

export const PLATFORM_OVERHEAD_RESERVE_PER_CREDIT_USD =
  PROMPT_CREDIT_RETAIL_USD * (PLATFORM_OVERHEAD_RESERVE_PERCENT / 100);

export function grossRevenuePerCreditUsd(priceCents: number, credits: number): number {
  if (!Number.isFinite(priceCents) || !Number.isFinite(credits) || priceCents <= 0 || credits <= 0) return 0;
  return (priceCents / 100) / credits;
}

export function validateCreditSaleEconomics(input: {
  priceCents: number;
  credits: number;
  paymentRiskReservePercent?: number;
  allowPromotionalDiscount?: boolean;
}) {
  const grossPerCreditUsd = grossRevenuePerCreditUsd(input.priceCents, input.credits);
  const paymentRiskReservePercent = input.paymentRiskReservePercent ?? PAYMENT_AND_RISK_RESERVE_PERCENT;
  const netAfterPaymentReserveUsd = grossPerCreditUsd * (1 - Math.max(0, paymentRiskReservePercent) / 100);
  const providerReserveUsd = MAX_PROVIDER_COST_PER_CREDIT_USD;
  const overheadReserveUsd = PLATFORM_OVERHEAD_RESERVE_PER_CREDIT_USD;
  const contributionUsd = netAfterPaymentReserveUsd - providerReserveUsd - overheadReserveUsd;
  const contributionMarginPercent = grossPerCreditUsd > 0 ? (contributionUsd / grossPerCreditUsd) * 100 : 0;
  const minimumSalePriceUsd = input.allowPromotionalDiscount
    ? PROMPT_CREDIT_MIN_EFFECTIVE_SALE_USD
    : PROMPT_CREDIT_RETAIL_USD;
  const minimumContributionMarginPercent = input.allowPromotionalDiscount
    ? MIN_PROMOTIONAL_CONTRIBUTION_MARGIN_PERCENT
    : TARGET_CONTRIBUTION_MARGIN_PERCENT;

  return {
    grossPerCreditUsd,
    netAfterPaymentReserveUsd,
    providerReserveUsd,
    overheadReserveUsd,
    contributionUsd,
    contributionMarginPercent,
    minimumSalePriceUsd,
    minimumContributionMarginPercent,
    eligible:
      grossPerCreditUsd + 1e-9 >= minimumSalePriceUsd &&
      contributionMarginPercent + 1e-9 >= minimumContributionMarginPercent,
  };
}


export type ProviderBudgetCheck = {
  credits: number;
  providerBudgetUsd: number;
  providerCostUsd: number;
  remainingBudgetUsd: number;
  utilizationPercent: number;
  eligible: boolean;
};

/**
 * Hard server-side invariant for paid AI execution.
 * A provider/model may only execute when its estimated cost fits inside the
 * provider reserve purchased by the operation's Prompt Credits.
 */
export function evaluateProviderBudget(credits: number, providerCostUsd: number): ProviderBudgetCheck {
  const safeCredits = Number.isFinite(credits) ? Math.max(0, credits) : 0;
  const safeCost = Number.isFinite(providerCostUsd) ? Math.max(0, providerCostUsd) : Number.POSITIVE_INFINITY;
  const providerBudgetUsd = safeCredits * MAX_PROVIDER_COST_PER_CREDIT_USD;
  const remainingBudgetUsd = providerBudgetUsd - safeCost;
  const utilizationPercent = providerBudgetUsd > 0
    ? (safeCost / providerBudgetUsd) * 100
    : safeCost === 0 ? 0 : Number.POSITIVE_INFINITY;

  return {
    credits: safeCredits,
    providerBudgetUsd: Number(providerBudgetUsd.toFixed(6)),
    providerCostUsd: Number.isFinite(safeCost) ? Number(safeCost.toFixed(6)) : safeCost,
    remainingBudgetUsd: Number.isFinite(remainingBudgetUsd) ? Number(remainingBudgetUsd.toFixed(6)) : remainingBudgetUsd,
    utilizationPercent: Number.isFinite(utilizationPercent) ? Number(utilizationPercent.toFixed(2)) : utilizationPercent,
    eligible: safeCredits > 0 && safeCost <= providerBudgetUsd + 1e-9,
  };
}

export function assertProviderBudget(credits: number, providerCostUsd: number): ProviderBudgetCheck {
  const check = evaluateProviderBudget(credits, providerCostUsd);
  if (!check.eligible) {
    const error = new Error('PROVIDER_COST_EXCEEDS_CREDIT_BUDGET') as Error & { budget?: ProviderBudgetCheck };
    error.budget = check;
    throw error;
  }
  return check;
}
