export function buildCrowdfundingCheckoutUrl(paymentLink: string, amountUsd: number): string {
  const url = new URL(paymentLink);
  url.searchParams.set('prefilled_amount', String(Math.round(amountUsd * 100)));
  return url.toString();
}