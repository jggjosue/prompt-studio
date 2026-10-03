/**
 * Economía central de Prompt Credits.
 *
 * Piso comercial: $0.01 por crédito.
 * Reservas sobre ese piso:
 * - proveedor IA: hasta 25%
 * - infraestructura/operación: 15%
 * - pagos/refunds/imprevistos: 10%
 *
 * Esto deja un objetivo mínimo de contribución del 50% por crédito antes de
 * impuestos y gastos fijos de la empresa. Los porcentajes son deliberadamente
 * conservadores y pueden ajustarse si cambian los costos reales.
 */
export const PROMPT_CREDIT_FLOOR_VALUE_USD = 0.01;
export const PROVIDER_COST_RESERVE_PERCENT = 25;
export const PLATFORM_OVERHEAD_RESERVE_PERCENT = 15;
export const PAYMENT_AND_RISK_RESERVE_PERCENT = 10;
export const TARGET_CONTRIBUTION_MARGIN_PERCENT =
  100 - PROVIDER_COST_RESERVE_PERCENT - PLATFORM_OVERHEAD_RESERVE_PERCENT - PAYMENT_AND_RISK_RESERVE_PERCENT;

export const MAX_PROVIDER_COST_PER_CREDIT_USD =
  PROMPT_CREDIT_FLOOR_VALUE_USD * (PROVIDER_COST_RESERVE_PERCENT / 100);

export const PLATFORM_OVERHEAD_RESERVE_PER_CREDIT_USD =
  PROMPT_CREDIT_FLOOR_VALUE_USD * (PLATFORM_OVERHEAD_RESERVE_PERCENT / 100);

export function grossRevenuePerCreditUsd(priceCents: number, credits: number): number {
  if (!Number.isFinite(priceCents) || !Number.isFinite(credits) || priceCents <= 0 || credits <= 0) return 0;
  return (priceCents / 100) / credits;
}

export function validateCreditSaleEconomics(input: {
  priceCents: number;
  credits: number;
  paymentRiskReservePercent?: number;
}) {
  const grossPerCreditUsd = grossRevenuePerCreditUsd(input.priceCents, input.credits);
  const paymentRiskReservePercent = input.paymentRiskReservePercent ?? PAYMENT_AND_RISK_RESERVE_PERCENT;
  const netAfterPaymentReserveUsd = grossPerCreditUsd * (1 - Math.max(0, paymentRiskReservePercent) / 100);
  const providerReserveUsd = MAX_PROVIDER_COST_PER_CREDIT_USD;
  const overheadReserveUsd = PLATFORM_OVERHEAD_RESERVE_PER_CREDIT_USD;
  const contributionUsd = netAfterPaymentReserveUsd - providerReserveUsd - overheadReserveUsd;

  return {
    grossPerCreditUsd,
    netAfterPaymentReserveUsd,
    providerReserveUsd,
    overheadReserveUsd,
    contributionUsd,
    contributionMarginPercent: grossPerCreditUsd > 0 ? (contributionUsd / grossPerCreditUsd) * 100 : 0,
    minimumContributionMarginPercent: TARGET_CONTRIBUTION_MARGIN_PERCENT,
    eligible:
      grossPerCreditUsd >= PROMPT_CREDIT_FLOOR_VALUE_USD &&
      contributionMarginPercent + 1e-9 >= TARGET_CONTRIBUTION_MARGIN_PERCENT,
  };
}
