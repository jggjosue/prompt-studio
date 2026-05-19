/**
 * Búsqueda difusa basada en distancia de Levenshtein.
 * Con `catalogIndex` (B+ Tree) se acota el conjunto de candidatos a O(log n + k)
 * antes del scoring O(k · m) en lugar de escanear todo el catálogo O(n).
 */

import type { CatalogSearchIndex } from '@/lib/catalog-search-index';

export type FuzzySearchOptions = {
  /** Distancia máxima absoluta (sobreescribe el cálculo adaptativo). */
  maxDistance?: number;
  /** Puntuación mínima 0–1 para considerar coincidencia (por defecto 0.55). */
  minScore?: number;
  /** Índice B+ invertido (ver `CatalogSearchIndex`). */
  catalogIndex?: CatalogSearchIndex;
  /** Requerido con `catalogIndex` para filtrar candidatos por id. */
  getId?: (item: unknown) => string;
};

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .trim();
}

/** Distancia adaptativa según longitud del término más corto. */
export function getAdaptiveMaxDistance(term: string): number {
  const len = term.length;
  if (len <= 1) return 0;
  if (len <= 3) return 1;
  if (len <= 6) return 2;
  return Math.max(2, Math.floor(len * 0.34));
}

/**
 * Distancia de Levenshtein con corte temprano si supera `maxDistance`.
 */
export function levenshteinDistance(
  a: string,
  b: string,
  maxDistance = Infinity
): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  let left = a;
  let right = b;
  if (left.length > right.length) {
    [left, right] = [right, left];
  }

  const lengthDiff = right.length - left.length;
  if (lengthDiff > maxDistance) return maxDistance + 1;

  let previous = new Array<number>(left.length + 1);
  for (let i = 0; i <= left.length; i++) previous[i] = i;

  for (let j = 1; j <= right.length; j++) {
    const current = new Array<number>(left.length + 1);
    current[0] = j;
    let rowMin = j;

    for (let i = 1; i <= left.length; i++) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      current[i] = Math.min(
        previous[i]! + 1,
        current[i - 1]! + 1,
        previous[i - 1]! + cost
      );
      rowMin = Math.min(rowMin, current[i]!);
    }

    if (rowMin > maxDistance) return maxDistance + 1;
    previous = current;
  }

  return previous[left.length]!;
}

/** Similitud 0–1 (1 = coincidencia exacta). */
export function fuzzySimilarity(a: string, b: string, maxDistance?: number): number {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) return 0.95;

  const limit = maxDistance ?? getAdaptiveMaxDistance(na.length <= nb.length ? na : nb);
  const dist = levenshteinDistance(na, nb, limit);
  if (dist > limit) return 0;

  return 1 - dist / Math.max(na.length, nb.length);
}

function tokenize(text: string): string[] {
  return normalize(text)
    .split(/[\s,·\-_|/]+/)
    .filter(Boolean);
}

/** ¿El término aparece de forma difusa dentro del texto (ventana deslizante)? */
export function fuzzySubstring(haystack: string, needle: string, maxDistance?: number): boolean {
  const h = normalize(haystack);
  const n = normalize(needle);
  if (!n) return true;
  if (n.length === 1) return h.includes(n);
  if (h.includes(n)) return true;

  const limit = maxDistance ?? getAdaptiveMaxDistance(n);
  const minLen = Math.max(1, n.length - limit);
  const maxLen = n.length + limit;

  for (let len = minLen; len <= maxLen; len++) {
    if (len > h.length) break;
    for (let i = 0; i <= h.length - len; i++) {
      const slice = h.slice(i, i + len);
      if (levenshteinDistance(slice, n, limit) <= limit) return true;
    }
  }
  return false;
}

function tokenFuzzyMatch(a: string, b: string, maxDistance?: number): boolean {
  if (a === b || a.includes(b) || b.includes(a)) return true;
  const limit = maxDistance ?? getAdaptiveMaxDistance(a.length <= b.length ? a : b);
  return levenshteinDistance(a, b, limit) <= limit;
}

/**
 * ¿La consulta coincide de forma difusa con el candidato (texto completo)?
 */
export function fuzzyMatch(
  query: string,
  candidate: string,
  options?: FuzzySearchOptions
): boolean {
  return fuzzyScore(query, candidate, options) > 0;
}

/**
 * Puntuación 0–1 de la consulta frente a uno o varios campos.
 */
export function fuzzyScore(
  query: string,
  candidate: string,
  options?: FuzzySearchOptions
): number {
  const q = normalize(query);
  const c = normalize(candidate);
  if (!q) return 1;
  if (!c) return 0;

  const minScore = options?.minScore ?? 0.55;

  if (c.includes(q)) return 1;

  const qTokens = tokenize(q);
  const cTokens = tokenize(c);

  if (qTokens.length === 0) return 1;

  let tokenScoreSum = 0;
  for (const qt of qTokens) {
    let best = 0;
    if (qt.length === 1) {
      best = c.includes(qt) ? 0.7 : 0;
    } else if (fuzzySubstring(c, qt, options?.maxDistance)) {
      best = 0.88;
    } else {
      for (const ct of cTokens) {
        best = Math.max(best, fuzzySimilarity(qt, ct, options?.maxDistance));
      }
    }
    if (best < minScore) return 0;
    tokenScoreSum += best;
  }

  const avgToken = tokenScoreSum / qTokens.length;
  const fullSim = fuzzySimilarity(q, c, options?.maxDistance);
  return Math.max(avgToken, fullSim >= minScore ? fullSim : 0);
}

/** Puntuación agregada sobre varios campos (toma el máximo). */
export function fuzzyScoreFields(
  query: string,
  fields: readonly string[],
  options?: FuzzySearchOptions
): number {
  if (!normalize(query)) return 1;
  let best = 0;
  for (const field of fields) {
    if (!field) continue;
    best = Math.max(best, fuzzyScore(query, field, options));
  }
  return best;
}

export function fuzzyMatchFields(
  query: string,
  fields: readonly string[],
  options?: FuzzySearchOptions
): boolean {
  return fuzzyScoreFields(query, fields, options) > 0;
}

export type FuzzyRanked<T> = { item: T; score: number };

/**
 * Filtra y ordena por relevancia difusa (mayor puntuación primero).
 */
function narrowWithCatalogIndex<T>(
  items: readonly T[],
  query: string,
  options?: FuzzySearchOptions
): readonly T[] {
  const index = options?.catalogIndex;
  const getId = options?.getId as ((item: T) => string) | undefined;
  if (!index || !getId) return items;

  const ids = index.candidateIds(query);
  if (!ids || ids.size >= items.length) return items;

  const narrowed = items.filter(item => ids.has(getId(item)));
  return narrowed.length > 0 ? narrowed : items;
}

export function fuzzyFilterSort<T>(
  items: readonly T[],
  query: string,
  getFields: (item: T) => readonly string[],
  options?: FuzzySearchOptions
): T[] {
  const q = normalize(query);
  if (!q) return [...items];

  const pool = narrowWithCatalogIndex(items, q, options);

  const minScore = options?.minScore ?? 0.55;
  const ranked: FuzzyRanked<T>[] = [];

  for (const item of pool) {
    const score = fuzzyScoreFields(query, getFields(item), options);
    if (score >= minScore) ranked.push({ item, score });
  }

  ranked.sort((a, b) => b.score - a.score);
  return ranked.map(r => r.item);
}
