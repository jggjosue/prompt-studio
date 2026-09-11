import aggregates from '@/data/review-aggregates.json';

/**
 * Notas medias por producto, generadas antes del build por
 * `scripts/build-review-aggregates.mjs`.
 *
 * Se lee de un fichero y no de la base de datos porque las fichas de producto
 * son estáticas: consultar por página añadiría 830 agregaciones a cada build.
 */
export type ReviewAggregate = {
  ratingValue: number;
  ratingCount: number;
};

type AggregateFile = {
  generatedAt: string | null;
  products: Record<string, { ratingValue?: number; ratingCount?: number }>;
};

const file = aggregates as AggregateFile;

/**
 * Nota de un producto, o `null` si no tiene reseñas publicadas.
 *
 * Devolver `null` es lo importante: **marcar una valoración que no existe es
 * spam estructurado** y Google puede penalizar el dominio entero por ello. Sin
 * reseñas no se emite `aggregateRating`, sin excepciones.
 */
export function getReviewAggregate(productId: string): ReviewAggregate | null {
  const entry = file.products?.[productId];
  if (!entry) return null;

  const ratingCount = Number(entry.ratingCount ?? 0);
  const ratingValue = Number(entry.ratingValue ?? 0);
  if (!Number.isFinite(ratingCount) || ratingCount < 1) return null;
  if (!Number.isFinite(ratingValue) || ratingValue < 1 || ratingValue > 5) return null;

  return { ratingValue, ratingCount };
}

/**
 * Fragmento `aggregateRating` de schema.org, listo para incrustar en un
 * Product. Devuelve `null` cuando no procede emitirlo.
 */
export function buildAggregateRatingSchema(productId: string) {
  const aggregate = getReviewAggregate(productId);
  if (!aggregate) return null;
  return {
    '@type': 'AggregateRating',
    ratingValue: aggregate.ratingValue,
    reviewCount: aggregate.ratingCount,
    bestRating: 5,
    worstRating: 1,
  };
}

/** Cuándo se generó el fichero. Útil para diagnosticar notas desfasadas. */
export function reviewAggregatesGeneratedAt(): string | null {
  return file.generatedAt ?? null;
}
