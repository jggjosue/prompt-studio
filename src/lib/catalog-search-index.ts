/**
 * Índice invertido sobre B+ Tree para catálogos en memoria (JSON / arrays).
 * Reduce candidatos de O(n) a O(log n + k) antes del scoring difuso (Levenshtein).
 *
 * En MongoDB/Atlas (si migras el catálogo a colecciones), el equivalente del lado
 * servidor es crear índices B-Tree, p. ej.:
 *   db.prompts.createIndex({ title: 'text', tags: 1 })
 *   db.prompts.createIndex({ 'tags': 1, title: 1 })
 * WiredTiger usa B-Trees internamente → find() por índice ≈ O(log n), no collection scan.
 */

import { BPlusTree } from '@/lib/bplus-tree';

function normalizeToken(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .trim();
}

function tokenize(text: string): string[] {
  return normalizeToken(text)
    .split(/[\s,·\-_|/]+/)
    .filter(t => t.length > 0);
}

/** Umbral mínimo de ítems para construir el árbol (evita overhead en listas tiny). */
export const CATALOG_INDEX_MIN_ITEMS = 24;

export type CatalogIndexStats = {
  itemCount: number;
  tokenCount: number;
  /** Complejidad teórica de lookup de token exacto. */
  lookupComplexity: 'O(log n)';
  /** Complejidad sin índice (escaneo lineal). */
  linearComplexity: 'O(n)';
};

/**
 * Índice B+ por token → conjunto de ids de registro.
 * Inspirado en índices B-Tree de MongoDB/PostgreSQL para evitar table scans.
 */
export class CatalogSearchIndex {
  private readonly tree = new BPlusTree<Set<string>>();
  private tokenCount = 0;

  static fromItems<T>(
    items: readonly T[],
    getId: (item: T) => string,
    getFields: (item: T) => readonly string[]
  ): CatalogSearchIndex | undefined {
    if (items.length < CATALOG_INDEX_MIN_ITEMS) return undefined;
    const index = new CatalogSearchIndex();
    index.build(items, getId, getFields);
    return index;
  }

  build<T>(
    items: readonly T[],
    getId: (item: T) => string,
    getFields: (item: T) => readonly string[]
  ): void {
    for (const item of items) {
      const id = getId(item);
      const keys = new Set<string>();

      for (const field of getFields(item)) {
        if (!field) continue;
        for (const token of tokenize(field)) {
          keys.add(token);
          if (token.length >= 3) {
            keys.add(token.slice(0, 3));
          }
        }
        const normalized = normalizeToken(field);
        if (normalized.length >= 2) {
          keys.add(normalized);
        }
      }

      for (const key of keys) {
        this.addPosting(key, id);
      }
    }
  }

  getStats(itemCount: number): CatalogIndexStats {
    return {
      itemCount,
      tokenCount: this.tokenCount,
      lookupComplexity: 'O(log n)',
      linearComplexity: 'O(n)',
    };
  }

  private addPosting(token: string, id: string): void {
    const existing = this.tree.search(token);
    if (existing) {
      existing.add(id);
      return;
    }
    this.tree.insert(token, new Set([id]));
    this.tokenCount++;
  }

  /**
   * Ids candidatos para la consulta (unión/intersección de postings).
   * `null` = sin restricción → escaneo completo permitido.
   */
  candidateIds(query: string): Set<string> | null {
    const q = normalizeToken(query);
    if (!q) return null;

    const qTokens = tokenize(q);
    if (qTokens.length === 0) return null;

    const perToken: Set<string>[] = qTokens.map(t => this.candidatesForToken(t));

    let result = intersectSets(perToken);
    if (result.size === 0) {
      result = unionSets(perToken);
    }

    if (result.size === 0) {
      const prefix = q.length >= 2 ? q.slice(0, Math.min(4, q.length)) : q;
      result = this.idsFromPrefix(prefix);
    }

    return result.size > 0 ? result : null;
  }

  private candidatesForToken(token: string): Set<string> {
    const exact = this.tree.search(token);
    if (exact && exact.size > 0) return new Set(exact);

    if (token.length >= 2) {
      const prefix = token.slice(0, Math.min(3, token.length));
      return this.idsFromPrefix(prefix);
    }

    return new Set();
  }

  private idsFromPrefix(prefix: string): Set<string> {
    const out = new Set<string>();
    for (const { value } of this.tree.prefixSearch(prefix)) {
      for (const id of value) out.add(id);
    }
    return out;
  }
}

function intersectSets(sets: Set<string>[]): Set<string> {
  if (sets.length === 0) return new Set();
  const [first, ...rest] = sets;
  if (!first) return new Set();
  const result = new Set<string>();
  for (const id of first) {
    if (rest.every(s => s.has(id))) result.add(id);
  }
  return result;
}

function unionSets(sets: Set<string>[]): Set<string> {
  const result = new Set<string>();
  for (const s of sets) {
    for (const id of s) result.add(id);
  }
  return result;
}
