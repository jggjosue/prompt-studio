const MINI_WEB_PRICE_USD = 5;
const ENTREPRENEUR_PRICE_USD = 10;
const PROFESSIONAL_PRICE_USD = 15;
const BUSINESS_PRICE_USD = 20;
const PREMIUM_PRICE_USD = 35;
const ELITE_PRICE_USD = 50;

function numericPrice(price?: string): number | null {
  if (!price) return null;
  const value = Number(price.replace(/[$,\s]/g, ''));
  return Number.isFinite(value) ? value : null;
}

export function getWebPageCheckoutUrl(price?: string): string | undefined {
  const priceUsd = numericPrice(price);

  if (priceUsd === MINI_WEB_PRICE_USD) {
    return process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_MINI_WEB_PLAN;
  }

  if (priceUsd === ENTREPRENEUR_PRICE_USD) {
    return process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_ENTREPRENEUR_PLAN;
  }

  if (priceUsd === PROFESSIONAL_PRICE_USD) {
    return process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_PROFESSIONAL_PLAN;
  }

  if (priceUsd === BUSINESS_PRICE_USD) {
    return process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_BUSINESS_PLAN;
  }

  if (priceUsd === PREMIUM_PRICE_USD) {
    return process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_PREMIUM_PLAN;
  }

  if (priceUsd === ELITE_PRICE_USD) {
    return process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_ELITE_PLAN;
  }

  return process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_BUSINESS_PLAN;
}
