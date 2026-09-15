export const INITIAL_FEED_ITEMS = 16;
export const FEED_PAGE_SIZE = 12;
export const HOME_FEED_LIMITS = {
  image: 24,
  video: 16,
  web: 24,
  animation: 16,
} as const;

/**
 * Intercala grupos conservando el orden interno de cada uno.
 * Así el primer lote representa todos los tipos sin cargar el catálogo completo.
 */
export function interleaveFeedGroups<T>(groups: readonly (readonly T[])[]): T[] {
  const output: T[] = [];
  const longestGroup = Math.max(0, ...groups.map(group => group.length));

  for (let index = 0; index < longestGroup; index += 1) {
    for (const group of groups) {
      const item = group[index];
      if (item !== undefined) output.push(item);
    }
  }

  return output;
}

export function initialFeedItemCount(total: number): number {
  return Math.min(Math.max(0, total), INITIAL_FEED_ITEMS);
}

export function nextFeedItemCount(current: number, total: number): number {
  return Math.min(Math.max(0, total), Math.max(0, current) + FEED_PAGE_SIZE);
}
