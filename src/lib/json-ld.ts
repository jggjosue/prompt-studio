export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

export function schemaDescription(
  value: string,
  fallback: string,
  maxLength: number = 5000
): string {
  let description = value;

  try {
    const parsed = JSON.parse(value) as {
      description?: unknown;
      prompt?: unknown;
      main_concept?: unknown;
    };
    const candidate =
      parsed.description ?? parsed.prompt ?? parsed.main_concept;
    if (typeof candidate === 'string') description = candidate;
  } catch {
    // Legacy catalog entries already contain plain text.
  }

  const normalized = description.replace(/\s+/g, ' ').trim() || fallback;
  if (normalized.length <= maxLength) return normalized;

  const truncated = normalized.slice(0, maxLength - 1);
  const lastSpace = truncated.lastIndexOf(' ');
  return `${truncated.slice(0, lastSpace > maxLength * 0.8 ? lastSpace : -1).trim()}…`;
}

export function digitalDeliveryDetails() {
  const immediate = {
    '@type': 'QuantitativeValue',
    minValue: 0,
    maxValue: 0,
    unitCode: 'DAY',
  };

  return {
    '@type': 'OfferShippingDetails',
    shippingDestination: {
      '@type': 'DefinedRegion',
      addressCountry: 'US',
    },
    shippingRate: {
      '@type': 'MonetaryAmount',
      value: 0,
      currency: 'USD',
    },
    deliveryTime: {
      '@type': 'ShippingDeliveryTime',
      handlingTime: immediate,
      transitTime: immediate,
    },
  };
}

export function digitalProductReturnPolicy(siteUrl: string) {
  return {
    '@type': 'MerchantReturnPolicy',
    applicableCountry: 'US',
    returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
    merchantReturnLink: `${siteUrl}/terms`,
  };
}
