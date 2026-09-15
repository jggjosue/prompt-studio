export type CatalogKind = 'image' | 'video' | 'web' | 'animation';

export type CatalogMetrics = {
  contentKey: string;
  views: number;
  clicks: number;
  likes: number;
  rating: number;
  ratingCount: number;
  likedByMe?: boolean;
};

export type RankableCatalogItem = {
  contentKey: string;
  editorialIndex: number;
};

const finiteNonNegative = (value: number): number =>
  Number.isFinite(value) ? Math.max(0, value) : 0;

/**
 * Puntuacion 0..100 explicable y resistente a catalogos con pocas muestras.
 * La valoracion se contrae hacia una media neutra y las tasas usan priors para
 * que una sola visita/accion no coloque un elemento nuevo por encima de todo.
 */
export function catalogRankingScore(metric: CatalogMetrics, maxViews: number): number {
  const views = finiteNonNegative(metric.views);
  const clicks = Math.min(views, finiteNonNegative(metric.clicks));
  const likes = Math.min(views, finiteNonNegative(metric.likes));
  const ratingCount = finiteNonNegative(metric.ratingCount);
  const rating = Math.min(5, finiteNonNegative(metric.rating));

  const bayesianRating = ((rating * ratingCount) + (3.5 * 8)) / (ratingCount + 8) / 5;
  const smoothedLikeRate = (likes + 0.8) / (views + 20);
  const smoothedClickRate = (clicks + 2) / (views + 20);
  const popularity = Math.log1p(views) / Math.max(1, Math.log1p(finiteNonNegative(maxViews)));

  return 100 * (
    bayesianRating * 0.45
    + Math.min(1, smoothedLikeRate) * 0.25
    + Math.min(1, smoothedClickRate) * 0.20
    + Math.min(1, popularity) * 0.10
  );
}

export function rankCatalogItems<T extends RankableCatalogItem>(
  items: T[],
  metrics: ReadonlyMap<string, CatalogMetrics>
): T[] {
  const maxViews = Math.max(0, ...items.map(item => metrics.get(item.contentKey)?.views ?? 0));
  return [...items].sort((left, right) => {
    const leftMetric = metrics.get(left.contentKey);
    const rightMetric = metrics.get(right.contentKey);
    const leftScore = leftMetric ? catalogRankingScore(leftMetric, maxViews) : 0;
    const rightScore = rightMetric ? catalogRankingScore(rightMetric, maxViews) : 0;
    return rightScore - leftScore || left.editorialIndex - right.editorialIndex;
  });
}

export function isCatalogContentKey(value: unknown): value is string {
  return typeof value === 'string'
    && /^(image|video|web|animation):[a-zA-Z0-9][a-zA-Z0-9._~-]{0,179}$/.test(value);
}
