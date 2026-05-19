import type { SubscriptionStatusResponse } from '@/app/api/subscription/status/route';

const STORAGE_KEY = 'ps:subscription-status:v1';
const SESSION_FETCHED_KEY = 'ps:subscription-status:api-called';

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

export type SubscriptionStoreSnapshot = SubscriptionStatusResponse & {
  ready: boolean;
};

const SNAP_NOT_READY: SubscriptionStoreSnapshot = {
  ...FREE,
  ready: false,
};

const SNAP_FREE_READY: SubscriptionStoreSnapshot = {
  ...FREE,
  ready: true,
};

let memoryEntry: CacheEntry | null = null;
let inflight: Promise<SubscriptionStatusResponse> | null = null;
/** Evita programar más de una carga por usuario por pestaña (React Strict Mode, re-renders). */
let loadScheduledForUser: string | null = null;
const sessionFetchedUsers = new Set<string>();
const listeners = new Set<() => void>();

let stableSnapKey = '';
let stableSnapState: SubscriptionStoreSnapshot = SNAP_NOT_READY;
const readySnapshotByKey = new Map<string, SubscriptionStoreSnapshot>();

function markSessionApiFetched(userId: string): void {
  sessionFetchedUsers.add(userId);
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(SESSION_FETCHED_KEY, userId);
  } catch {
    /* quota / private mode */
  }
}

export function hasSessionApiFetched(userId: string): boolean {
  if (sessionFetchedUsers.has(userId)) return true;
  if (typeof window === 'undefined') return false;
  try {
    return sessionStorage.getItem(SESSION_FETCHED_KEY) === userId;
  } catch {
    return false;
  }
}

function clearSessionApiFetched(): void {
  sessionFetchedUsers.clear();
  loadScheduledForUser = null;
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(SESSION_FETCHED_KEY);
  } catch {
    /* ignore */
  }
}

function buildSnapshotKey(
  isLoaded: boolean,
  isSignedIn: boolean,
  userId: string | null | undefined
): string {
  if (!isLoaded) return '@loading';
  if (!isSignedIn || !userId) return '@guest';
  const entry = getEntry(userId);
  if (!entry) return `@${userId}:pending`;
  const d = entry.data;
  return `@${userId}:${d.plan}:${d.status ?? ''}:${d.currentPeriodEnd ?? ''}:${d.billingCycle ?? ''}`;
}

function readySnapshotFor(
  userId: string,
  data: SubscriptionStatusResponse
): SubscriptionStoreSnapshot {
  const dataKey = `${data.plan}:${data.status ?? ''}:${data.currentPeriodEnd ?? ''}:${data.billingCycle ?? ''}`;
  const mapKey = `${userId}:${dataKey}`;
  const existing = readySnapshotByKey.get(mapKey);
  if (existing) return existing;
  const snap: SubscriptionStoreSnapshot = { ...data, ready: true };
  readySnapshotByKey.set(mapKey, snap);
  return snap;
}

function computeSnapshot(
  isLoaded: boolean,
  isSignedIn: boolean,
  userId: string | null | undefined
): SubscriptionStoreSnapshot {
  if (!isLoaded) return SNAP_NOT_READY;
  if (!isSignedIn || !userId) return SNAP_FREE_READY;
  const cached = getCachedSubscriptionStatus(userId);
  if (!cached) return SNAP_NOT_READY;
  return readySnapshotFor(userId, cached);
}

export function getStableSubscriptionSnapshot(
  isLoaded: boolean,
  isSignedIn: boolean,
  userId: string | null | undefined
): SubscriptionStoreSnapshot {
  const key = buildSnapshotKey(isLoaded, isSignedIn, userId);
  if (key === stableSnapKey) return stableSnapState;
  stableSnapKey = key;
  stableSnapState = computeSnapshot(isLoaded, isSignedIn, userId);
  return stableSnapState;
}

function invalidateStableSnapshot(): void {
  stableSnapKey = '';
}

function notify(): void {
  invalidateStableSnapshot();
  listeners.forEach(fn => fn());
}

function readSessionStorage(userId: string): CacheEntry | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredPayload;
    if (parsed.v !== 1 || parsed.userId !== userId) return null;
    return {
      userId: parsed.userId,
      data: parsed.data,
      fetchedAt: parsed.fetchedAt,
    };
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
  if (memoryEntry?.userId === userId) {
    return memoryEntry;
  }
  const fromStorage = readSessionStorage(userId);
  if (fromStorage) {
    memoryEntry = fromStorage;
    if (hasSessionApiFetched(userId)) {
      sessionFetchedUsers.add(userId);
    }
    return fromStorage;
  }
  return null;
}

function commit(userId: string, data: SubscriptionStatusResponse): CacheEntry {
  const entry: CacheEntry = { userId, data, fetchedAt: Date.now() };
  memoryEntry = entry;
  writeSessionStorage(entry);
  markSessionApiFetched(userId);
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
 * Una petición HTTP por usuario y pestaña de navegador por sesión.
 * Vuelve a llamar solo con `{ force: true }` o `invalidateSubscriptionStatusCache()`.
 */
export async function loadSubscriptionStatus(
  userId: string,
  options: { force?: boolean } = {}
): Promise<SubscriptionStatusResponse> {
  const { force = false } = options;
  const existing = getEntry(userId);

  if (!force && hasSessionApiFetched(userId)) {
    if (existing) return existing.data;
    return FREE;
  }

  if (inflight) return inflight;

  inflight = fetchFromApi()
    .then(data => {
      commit(userId, data);
      return data;
    })
    .catch(() => {
      const fallback = existing?.data ?? FREE;
      if (!existing) {
        commit(userId, FREE);
        return FREE;
      }
      markSessionApiFetched(userId);
      return fallback;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

/**
 * Punto único de entrada desde el provider: deduplica Strict Mode y re-renders.
 */
export function scheduleSubscriptionStatusLoad(
  userId: string,
  options: { force?: boolean } = {}
): Promise<SubscriptionStatusResponse> {
  const { force = false } = options;

  if (!force && hasSessionApiFetched(userId)) {
    const cached = getEntry(userId);
    return Promise.resolve(cached?.data ?? FREE);
  }

  if (!force && loadScheduledForUser === userId) {
    if (inflight) return inflight;
    const cached = getEntry(userId);
    if (cached) return Promise.resolve(cached.data);
  }

  loadScheduledForUser = userId;
  return loadSubscriptionStatus(userId, { force });
}

export function getCachedSubscriptionStatus(
  userId: string | null | undefined
): SubscriptionStatusResponse | null {
  if (!userId) return null;
  return getEntry(userId)?.data ?? null;
}

export function clearSubscriptionStatusCache(): void {
  const hadData =
    memoryEntry !== null ||
    (typeof window !== 'undefined' && sessionStorage.getItem(STORAGE_KEY) !== null);

  memoryEntry = null;
  inflight = null;
  readySnapshotByKey.clear();
  clearSessionApiFetched();

  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }

  if (hadData) notify();
}

/** Tras checkout, webhook o cambio manual de plan: permite un nuevo fetch. */
export function invalidateSubscriptionStatusCache(): void {
  sessionFetchedUsers.clear();
  loadScheduledForUser = null;

  if (memoryEntry) {
    memoryEntry = { ...memoryEntry, fetchedAt: 0 };
  }

  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem(SESSION_FETCHED_KEY);
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
