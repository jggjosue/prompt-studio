export interface PromptVersionLike {
  version: number;
  basedOnVersion: number | null;
}

export function nextVersionNumber(versions: readonly PromptVersionLike[]): number {
  return versions.reduce((max, item) => Math.max(max, item.version), 0) + 1;
}

/**
 * Ancestros de una versión: la cadena de `basedOnVersion` hacia arriba,
 * ordenada de la más antigua a la más reciente. La propia versión no se
 * incluye.
 */
export function ancestorsOf<T extends PromptVersionLike>(versions: readonly T[], versionNumber: number): T[] {
  const byNumber = new Map<number, T>(versions.map((item) => [item.version, item] as const));
  const result: T[] = [];
  const seen = new Set<number>();
  let current = byNumber.get(versionNumber);
  while (current && current.basedOnVersion != null) {
    const parentNumber = current.basedOnVersion;
    if (parentNumber === versionNumber || seen.has(parentNumber) || !byNumber.has(parentNumber)) break;
    const parent = byNumber.get(parentNumber) as T;
    seen.add(parentNumber);
    result.unshift(parent);
    current = parent;
  }
  return result;
}

/**
 * Descendientes de una versión: todos los nodos cuyo camino de
 * `basedOnVersion` llega a la versión dada (recorrido en anchura, hijos
 * ordenados por número de versión). La propia versión no se incluye.
 */
export function descendantsOf<T extends PromptVersionLike>(versions: readonly T[], versionNumber: number): T[] {
  const childrenOf = new Map<number, T[]>();
  for (const item of versions) {
    if (item.basedOnVersion != null) {
      const list = childrenOf.get(item.basedOnVersion) ?? [];
      list.push(item);
      childrenOf.set(item.basedOnVersion, list);
    }
  }
  const sorted = (list: T[]) => [...list].sort((a, b) => a.version - b.version);
  const result: T[] = [];
  const queue = [...sorted(childrenOf.get(versionNumber) ?? [])];
  const seen = new Set<number>([versionNumber]);
  while (queue.length > 0) {
    const node = queue.shift() as T;
    if (seen.has(node.version)) continue;
    seen.add(node.version);
    result.push(node);
    queue.push(...sorted(childrenOf.get(node.version) ?? []));
  }
  return result;
}

export interface LineageTraversal<T extends PromptVersionLike> {
  ancestors: T[];
  descendants: T[];
}

export function lineage<T extends PromptVersionLike>(versions: readonly T[], versionNumber: number): LineageTraversal<T> {
  return { ancestors: ancestorsOf(versions, versionNumber), descendants: descendantsOf(versions, versionNumber) };
}