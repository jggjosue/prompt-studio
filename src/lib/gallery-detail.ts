import type { ImagePlaceholder } from '@/lib/placeholder-images';
import type { VideoProp } from '@/lib/placeholder-videos';

export type GalleryItem = ImagePlaceholder | VideoProp;

export type ManualActionRisk = {
  hasLowValueContent: boolean;
  hasDuplicateTitle: boolean;
  wordCount: number;
  duplicateCount: number;
  hasRisk: boolean;
};

function normalizedTokens(values: unknown[]): Set<string> {
  return new Set(
    values
      .filter((value): value is string => typeof value === 'string')
      .flatMap(value => value.toLowerCase().split(/[^\p{L}\p{N}]+/u))
      .filter(token => token.length > 2)
  );
}

function stableIdScore(id: string): number {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) >>> 0;
  }
  return hash;
}

/** Selects a small, stable and relevant set on the server instead of shipping a catalog to the browser. */
export function selectRelatedGalleryItems(
  item: GalleryItem,
  candidates: GalleryItem[],
  limit = 3
): GalleryItem[] {
  if (limit <= 0) return [];
  const itemTags = normalizedTokens(item.tags ?? []);
  const itemContext = normalizedTokens([item.title, item.imageHint]);

  return candidates
    .filter(candidate => candidate.id !== item.id && candidate.type === item.type && candidate.imageUrl)
    .map(candidate => {
      const candidateTags = normalizedTokens(candidate.tags ?? []);
      const candidateContext = normalizedTokens([candidate.title, candidate.imageHint]);
      const sharedTags = [...itemTags].filter(tag => candidateTags.has(tag)).length;
      const sharedContext = [...itemContext].filter(token => candidateContext.has(token)).length;
      return { candidate, score: sharedTags * 10 + sharedContext * 2 };
    })
    .sort((left, right) =>
      right.score - left.score || stableIdScore(left.candidate.id) - stableIdScore(right.candidate.id)
    )
    .slice(0, limit)
    .map(result => result.candidate);
}

export function assessManualActionRisk(item: GalleryItem, candidates: GalleryItem[]): ManualActionRisk {
  const normalizedTitle = item.title.trim().toLowerCase();
  const duplicateCount = candidates.filter(
    candidate => candidate.title.trim().toLowerCase() === normalizedTitle
  ).length;
  const plainText = item.description
    .replace(/[{}[\]":,]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const wordCount = plainText ? plainText.split(' ').length : 0;
  const hasLowValueContent = wordCount < 45;
  const hasDuplicateTitle = duplicateCount > 1;

  return {
    hasLowValueContent,
    hasDuplicateTitle,
    wordCount,
    duplicateCount,
    hasRisk: hasLowValueContent || hasDuplicateTitle,
  };
}
