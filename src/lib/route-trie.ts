/**
 * Árbol de prefijos (Trie) para emparejar rutas del navegador en O(longitud)
 * sin recargar la página — usado por la navegación client-side de la app.
 */

export type RouteTrieMeta = {
  /** Identificador de grupo de navegación (p. ej. "library", "tags") */
  groupId?: string;
  /** Prioridad de prefetch (mayor = más urgente) */
  prefetchPriority?: number;
};

type TrieNode = {
  children: Map<string, TrieNode>;
  meta?: RouteTrieMeta;
};

const DYNAMIC_SEGMENT = '*';

function splitPathname(pathname: string): string[] {
  const path = pathname.split('?')[0]?.split('#')[0] ?? '/';
  if (path === '/' || path === '') return [];
  return path.replace(/^\//, '').split('/').filter(Boolean);
}

function normalizeRoutePath(path: string): string[] {
  const pathOnly = path.split('?')[0]?.split('#')[0] ?? path;
  if (pathOnly === '/' || pathOnly === '') return [];
  return pathOnly
    .replace(/^\//, '')
    .split('/')
    .filter(Boolean)
    .map(segment =>
      segment.startsWith('[') && segment.endsWith(']') ? DYNAMIC_SEGMENT : segment
    );
}

export class RouteTrie {
  private readonly root: TrieNode = { children: new Map() };

  insert(path: string, meta?: RouteTrieMeta): void {
    const segments = normalizeRoutePath(path);
    let node = this.root;

    if (segments.length === 0) {
      node.meta = { ...node.meta, ...meta };
      return;
    }

    for (const segment of segments) {
      if (!node.children.has(segment)) {
        node.children.set(segment, { children: new Map() });
      }
      node = node.children.get(segment)!;
    }

    node.meta = { ...node.meta, ...meta };
  }

  /** Coincide si pathname empieza por el prefijo registrado (rutas estáticas). */
  hasPrefix(pathname: string, prefix: string): boolean {
    if (prefix === '/') return pathname === '/' || pathname === '';
    const normalized =
      pathname.split('?')[0]?.split('#')[0] ?? pathname;
    return normalized === prefix || normalized.startsWith(`${prefix}/`);
  }

  /** True si algún prefijo de la lista coincide con pathname. */
  matchesAnyPrefix(pathname: string, prefixes: readonly string[]): boolean {
    for (const prefix of prefixes) {
      if (this.hasPrefix(pathname, prefix)) return true;
    }
    return false;
  }

  /**
   * Recorre el trie siguiendo los segmentos de pathname (con fallback a '*').
   * Devuelve metadatos acumulados en nodos visitados (coincidencia por prefijo).
   */
  matchPath(pathname: string): RouteTrieMeta[] {
    const segments = splitPathname(pathname);
    const matches: RouteTrieMeta[] = [];
    let node = this.root;

    if (node.meta) matches.push(node.meta);

    for (const segment of segments) {
      const next =
        node.children.get(segment) ?? node.children.get(DYNAMIC_SEGMENT);
      if (!next) break;
      node = next;
      if (node.meta) matches.push(node.meta);
    }

    return matches;
  }

  isActiveGroup(pathname: string, groupId: string): boolean {
    return this.matchPath(pathname).some(m => m.groupId === groupId);
  }

  /** Rutas internas ordenadas por prioridad de prefetch (mayor primero). */
  getPrefetchPaths(): string[] {
    const entries: { path: string; priority: number }[] = [];
    this.collectPaths(this.root, '', entries);
    return entries
      .sort((a, b) => b.priority - a.priority)
      .map(e => e.path);
  }

  private collectPaths(
    node: TrieNode,
    prefix: string,
    out: { path: string; priority: number }[]
  ): void {
    if (node.meta?.prefetchPriority != null && prefix) {
      out.push({
        path: prefix,
        priority: node.meta.prefetchPriority,
      });
    }

    for (const [segment, child] of node.children) {
      if (segment === DYNAMIC_SEGMENT) continue;
      const next =
        prefix === '' ? `/${segment}` : `${prefix}/${segment}`;
      this.collectPaths(child, next, out);
    }
  }
}
