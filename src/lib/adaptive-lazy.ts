/**
 * Márgenes y umbrales adaptativos para Intersection Observer según
 * red del usuario (Network Information API) y tipo de medio.
 */

export type LazyMediaKind = 'image' | 'video' | 'iframe';

type ConnectionLike = {
  saveData?: boolean;
  effectiveType?: string;
};

const MARGIN_BY_NETWORK: Record<string, Record<LazyMediaKind, string>> = {
  saveData: { image: '80px', video: '40px', iframe: '40px' },
  'slow-2g': { image: '120px', video: '60px', iframe: '60px' },
  '2g': { image: '120px', video: '60px', iframe: '60px' },
  '3g': { image: '200px', video: '120px', iframe: '100px' },
  default: { image: '400px', video: '250px', iframe: '200px' },
};

function getConnection(): ConnectionLike | undefined {
  if (typeof navigator === 'undefined') return undefined;
  return (navigator as Navigator & { connection?: ConnectionLike }).connection;
}

/** rootMargin adaptativo: más anticipación en redes rápidas, menos en ahorro de datos. */
export function getAdaptiveRootMargin(kind: LazyMediaKind = 'image'): string {
  const conn = getConnection();
  if (conn?.saveData) return MARGIN_BY_NETWORK.saveData[kind];
  const effective = conn?.effectiveType ?? 'default';
  const bucket =
    effective in MARGIN_BY_NETWORK ? effective : 'default';
  return MARGIN_BY_NETWORK[bucket][kind];
}

export const DEFAULT_LAZY_THRESHOLD: number | number[] = 0;
