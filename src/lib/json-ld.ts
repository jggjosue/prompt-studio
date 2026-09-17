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

type JsonLdRecord = Record<string, unknown>;
type ReviewInput = {
  author: string;
  rating: number;
  body?: string;
};

export function buildOrganizationSchema(input: {
  url: string;
  name: string;
  logoUrl: string;
  sameAs?: string[];
}): JsonLdRecord {
  return {
    '@context': 'https://id': `${input.url}#organization`,
    name: input.name,
    url: input.url,
    logo: { '@type': 'ImageObject', url: input.logoUrl },
    ...(input.sameAs?.length ? { sameAs: input.sameAs } : {}),
  };
}

export function buildWebSiteSchema(input: {
  url: string;
  name: string;
  alternateName?: string;
  publisherId?: string;
}): JsonLdRecord {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${input.url}#website`,
    url: input.url,
    name: input.name,
    ...(input.alternateName ? { alternateName: input.alternateName } : {}),
    ...(input.publisherId ? { publisher: { '@id': input.publisherId } } : {}),
  };
}

export function buildBreadcrumbSchema(items: Array<{ name: string; url: string }>): JsonLdRecord | null {
  if (items.length < 2) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildProductSchema(input: {
  id: string;
  name: string;
  description: string;
  images: string[];
  brand: string;
  category?: string;
  offer?: { url: string; price: number | string; currency: string; availability?: string };
  reviews?: ReviewInput[];
}): JsonLdRecord {
  const reviews = (input.reviews ?? []).filter(review =>
    review.author.trim() && Number.isFinite(review.rating) && review.rating >= 1 && review.rating <= 5
  );
  return {
    '@context': 'https://id': input.id,
    name: input.name,
    description: input.description,
    image: input.images,
    brand: { '@type': 'Brand', name: input.brand },
    ...(input.category ? { category: input.category } : {}),
    ...(input.offer ? {
      offers: {
        '@type': 'Offer',
        url: input.offer.url,
        price: input.offer.price,
        priceCurrency: input.offer.currency,
        availability: input.offer.availability ?? 'https://schema.org/InStock',
      },
    } : {}),
    ...(reviews.length ? {
      review: reviews.map(review => ({
        '@type': 'Review',
        author: { '@type': 'Person', name: review.author },
        reviewRating: { '@type': 'Rating', ratingValue: review.rating, bestRating: 5, worstRating: 1 },
        ...(review.body ? { reviewBody: review.body } : {}),
      })),
    } : {}),
  };
}

export function buildSoftwareApplicationSchema(input: {
  id: string;
  name: string;
  url: string;
  description: string;
  category: string;
  operatingSystem?: string;
  offer?: { price: number | string; currency: string };
}): JsonLdRecord {
  return {
    '@context': 'https://id': input.id,
    name: input.name,
    url: input.url,
    description: input.description,
    applicationCategory: input.category,
    operatingSystem: input.operatingSystem ?? 'Web',
    ...(input.offer ? {
      offers: { '@type': 'Offer', price: input.offer.price, priceCurrency: input.offer.currency },
    } : {}),
  };
}

export function buildArticleSchema(input: {
  id: string;
  url: string;
  headline: string;
  description: string;
  imageUrl?: string;
  datePublished: string;
  dateModified?: string;
  authorName: string;
  publisherId: string;
}): JsonLdRecord {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': input.id,
    mainEntityOfPage: input.url,
    headline: input.headline,
    description: input.description,
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    author: { '@type': 'Person', name: input.authorName },
    publisher: { '@id': input.publisherId },
    ...(input.imageUrl ? { image: [input.imageUrl] } : {}),
  };
}

export function buildFaqSchema(input: {
  eligible: boolean;
  items: Array<{ question: string; answer: string; visible?: boolean }>;
}): JsonLdRecord | null {
  if (!input.eligible) return null;
  const items = input.items.filter(item => item.visible !== false && item.question.trim() && item.answer.trim());
  if (!items.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

export function buildImageObjectSchema(input: {
  id: string;
  url: string;
  contentUrl: string;
  name: string;
  description: string;
}): JsonLdRecord {
  return {
    '@context': 'https://id': input.id,
    url: input.url,
    contentUrl: input.contentUrl,
    name: input.name,
    description: input.description,
  };
}

export function buildVideoObjectSchema(input: {
  id: string;
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate?: string;
  contentUrl?: string;
  embedUrl?: string;
  duration?: string;
}): JsonLdRecord | null {
  // Google exige una fecha real. No se inventa una fecha para completar el schema.
  if (!input.uploadDate) return null;
  return {
    '@context': 'https://id': input.id,
    name: input.name,
    description: input.description,
    thumbnailUrl: [input.thumbnailUrl],
    uploadDate: input.uploadDate,
    ...(input.contentUrl ? { contentUrl: input.contentUrl } : {}),
    ...(input.embedUrl ? { embedUrl: input.embedUrl } : {}),
    ...(input.duration ? { duration: input.duration } : {}),
  };
}
