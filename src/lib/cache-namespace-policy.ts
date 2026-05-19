/**
 * Políticas LRU por tipo de fragmento: qué permanece en RAM (L1/L2) y cuándo expulsar.
 *
 * TTL: caducidad por inactividad temporal.
 * maxEntries / maxSizeBytes: expulsión LRU al llenar el namespace.
 */

export type CacheNamespace =
  | 'r2-bytes'
  | 'web-asset'
  | 'demo-bundle'
  | 'prompt-json'
  | 'catalog'
  | 'readability';

export type CacheNamespacePolicy = {
  /** Descripción para operaciones / stats. */
  label: string;
  maxEntries: number;
  maxSizeBytes: number;
  defaultTtlMs: number;
};

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (!raw?.trim()) return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

const MB = 1024 * 1024;

/** Defaults globales (env) — fallback si el namespace no define override. */
export function getGlobalLruDefaults(): Pick<
  CacheNamespacePolicy,
  'maxEntries' | 'maxSizeBytes' | 'defaultTtlMs'
> {
  return {
    maxEntries: parsePositiveInt(process.env.CACHE_LRU_MAX_ENTRIES, 256),
    maxSizeBytes:
      parsePositiveInt(process.env.CACHE_LRU_MAX_MB, 128) * MB,
    defaultTtlMs: parsePositiveInt(process.env.CACHE_LRU_TTL_MS, 3_600_000),
  };
}

const POLICIES: Record<CacheNamespace, CacheNamespacePolicy> = {
  'prompt-json': {
    label: 'JSON de prompts en disco',
    maxEntries: 64,
    maxSizeBytes: 32 * MB,
    defaultTtlMs: 60 * 60 * 1000,
  },
  catalog: {
    label: 'Catálogos API (landings, listados)',
    maxEntries: parsePositiveInt(process.env.CACHE_LRU_CATALOG_MAX_ENTRIES, 48),
    maxSizeBytes: 24 * MB,
    defaultTtlMs: 15 * 60 * 1000,
  },
  readability: {
    label: 'Índice de legibilidad de landings',
    maxEntries: 16,
    maxSizeBytes: 8 * MB,
    defaultTtlMs: 5 * 60 * 1000,
  },
  'demo-bundle': {
    label: 'Bundles HTML refactory (R2/local)',
    maxEntries: 80,
    maxSizeBytes: 64 * MB,
    defaultTtlMs: 30 * 60 * 1000,
  },
  'web-asset': {
    label: 'Assets transcodificados (imágenes)',
    maxEntries: parsePositiveInt(process.env.CACHE_LRU_ASSET_MAX_ENTRIES, 120),
    maxSizeBytes: 96 * MB,
    defaultTtlMs: 6 * 60 * 60 * 1000,
  },
  'r2-bytes': {
    label: 'Objetos R2 en bruto',
    maxEntries: 64,
    maxSizeBytes: 128 * MB,
    defaultTtlMs: 6 * 60 * 60 * 1000,
  },
};

export function getCacheNamespacePolicy(
  namespace: CacheNamespace
): CacheNamespacePolicy {
  const global = getGlobalLruDefaults();
  const specific = POLICIES[namespace];
  return {
    ...specific,
    maxEntries: specific.maxEntries ?? global.maxEntries,
    maxSizeBytes: specific.maxSizeBytes ?? global.maxSizeBytes,
    defaultTtlMs: specific.defaultTtlMs ?? global.defaultTtlMs,
  };
}

export function listCacheNamespaces(): CacheNamespace[] {
  return Object.keys(POLICIES) as CacheNamespace[];
}
