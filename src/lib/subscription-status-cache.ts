import type { SubscriptionStatusResponse } from '@/app/api/subscription/status/route';

const STORAGE_KEY = 'ps:subscription-status:v1';
/** Datos considerados frescos: no se vuelve a pedir la API. */
const FRESH_TTL_MS = 5 * 60 * 1000;
/** Tras esto se ignora la caché y se fuerza refetch. */
const MAX_STALE_MS = 30 * 60 * 1000;
/** Mínimo entre refetches en segundo plano (stale-while-revalidate). */
const MIN_BACKGROUND_REFETCH_MS = 60 * 1000;

type CacheEntry = {
  userId: string;
  data: SubscriptionStatusResponse;
  fetchedAt: number;
};

type StoredPayload = {
  v: 1;
  userId: string;
  data: SubscriptionStatusResponse;
  fetchedAt: number;
};

const FREE: SubscriptionStatusResponse = {
  plan: 'free',
  status: null,
  currentPeriodEnd: null,
  billingCycle: null,
};

let memoryEntry: CacheEntry | null = null;
let inflight: Promise<SubscriptionStatusResponse> | null = null;
let lastBackgroundAttempt = 0;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach(fn => fn());
}

function isFresh(entry: CacheEntry, now = Date.now()): boolean {
  return now - entry.fetchedAt < FRESH_TTL_MS;
}

function isUsable(entry: CacheEntry, now = Date.now()): boolean {
  return now - entry.fetchedAt < MAX_STALE_MS;
}

function readSessionStorage(userId: string): CacheEntry | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredPayload;
    if (parsed.v !== 1 || parsed.userId !== userId) return null;
    const entry: CacheEntry = {
      userId: parsed.userId,
      data: parsed.data,
      fetchedAt: parsed.fetchedAt,
    };
    return isUsable(entry) ? entry : null;
  } catch {
    return null;
  }
}

function writeSessionStorage(entry: CacheEntry): void {
  if (typeof window === 'undefined') return;
  try {
    const payload: StoredPayload = {
      v: 1,
      userId: entry.userId,
      data: entry.data,
      fetchedAt: entry.fetchedAt,
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* quota / private mode */
  }
}

function getEntry(userId: string): CacheEntry | null {
  if (memoryEntry?.userId === userId && isUsable(memoryEntry)) {
    return memoryEntry;
  }
  const fromStorage = readSessionStorage(userId);
  if (fromStorage) {
    memoryEntry = fromStorage;
    return fromStorage;
  }
  return null;
}

function commit(userId: string, data: SubscriptionStatusResponse): CacheEntry {
  const entry: CacheEntry = { userId, data, fetchedAt: Date.now() };
  memoryEntry = entry;
  writeSessionStorage(entry);
  notify();
  return entry;
}

async function fetchFromApi(): Promise<SubscriptionStatusResponse> {
  const res = await fetch('/api/subscription/status', {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) return FREE;
  return (await res.json()) as SubscriptionStatusResponse;
}

/**
 * Una sola petición en vuelo para todos los consumidores del hook.
 * `force` ignora frescura; sin force aplica TTL + stale-while-revalidate.
 */
export async function loadSubscriptionStatus(
  userId: string,
  options: { force?: boolean } = {}
): Promise<SubscriptionStatusResponse> {
  const { force = false } = options;
  const existing = getEntry(userId);

  if (!force && existing && isFresh(existing)) {
    return existing.data;
  }

  if (!force && existing && isUsable(existing)) {
    const now = Date.now();
    if (now - lastBackgroundAttempt >= MIN_BACKGROUND_REFETCH_MS) {
      lastBackgroundAttempt = now;
      void refreshInBackground(userId);
    }
    return existing.data;
  }

  if (inflight) return inflight;

  inflight = fetchFromApi()
    .then(data => {
      commit(userId, data);
      return data;
    })
    .catch(() => {
      const fallback = existing?.data ?? FREE;
      if (existing) return fallback;
      commit(userId, FREE);
      return FREE;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

async function refreshInBackground(userId: string): Promise<void> {
  if (inflight) return;
  try {
    const data = await fetchFromApi();
    commit(userId, data);
  } catch {
    /* keep stale cache */
  }
}

export function getCachedSubscriptionStatus(
  userId: string | null | undefined
): SubscriptionStatusResponse | null {
  if (!userId) return null;
  return getEntry(userId)?.data ?? null;
}

export function clearSubscriptionStatusCache(): void {
  memoryEntry = null;
  inflight = null;
  lastBackgroundAttempt = 0;
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
  notify();
}

/** Tras checkout o webhook: forzar próximo fetch. */
export function invalidateSubscriptionStatusCache(): void {
  if (memoryEntry) {
    memoryEntry = { ...memoryEntry, fetchedAt: 0 };
  }
  if (typeof window !== 'undefined') {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredPayload;
        sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ ...parsed, fetchedAt: 0 })
        );
      }
    } catch {
      /* ignore */
    }
  }
  notify();
}

export function subscribeSubscriptionStatus(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const subscriptionCacheTuning = {
  FRESH_TTL_MS,
  MAX_STALE_MS,
  MIN_BACKGROUND_REFETCH_MS,
} as const;
