'use client';

import {
  clearSubscriptionStatusCache,
  getCachedSubscriptionStatus,
  getStableSubscriptionSnapshot,
  hasSessionApiFetched,
  scheduleSubscriptionStatusLoad,
  subscribeSubscriptionStatus,
  type SubscriptionStoreSnapshot,
} from '@/lib/subscription-status-cache';
import { useAuth } from '@clerk/nextjs';
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

const SubscriptionStatusContext =
  createContext<SubscriptionStoreSnapshot | null>(null);

function syncSnapshot(
  isLoaded: boolean,
  isSignedIn: boolean,
  userId: string | null | undefined
): SubscriptionStoreSnapshot {
  return getStableSubscriptionSnapshot(isLoaded, isSignedIn, userId);
}

export function SubscriptionStatusProvider({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const wasSignedInRef = useRef(false);
  const lastLoadedUserIdRef = useRef<string | null>(null);

  const [snapshot, setSnapshot] = useState<SubscriptionStoreSnapshot>(() =>
    syncSnapshot(false, false, null)
  );

  useEffect(() => {
    const apply = () => {
      setSnapshot(prev => {
        const next = syncSnapshot(isLoaded, isSignedIn, userId);
        return prev === next ? prev : next;
      });
    };

    apply();
    return subscribeSubscriptionStatus(apply);
  }, [isLoaded, isSignedIn, userId]);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn || !userId) {
      if (wasSignedInRef.current) {
        clearSubscriptionStatusCache();
        wasSignedInRef.current = false;
      }
      lastLoadedUserIdRef.current = null;
      setSnapshot(prev => {
        const next = syncSnapshot(isLoaded, false, null);
        return prev === next ? prev : next;
      });
      return;
    }

    wasSignedInRef.current = true;

    const cached = getCachedSubscriptionStatus(userId);
    if (cached) {
      setSnapshot(prev => {
        const next = syncSnapshot(isLoaded, isSignedIn, userId);
        return prev === next ? prev : next;
      });
    }

    if (
      lastLoadedUserIdRef.current === userId &&
      hasSessionApiFetched(userId)
    ) {
      return;
    }

    lastLoadedUserIdRef.current = userId;
    void scheduleSubscriptionStatusLoad(userId);
  }, [isLoaded, isSignedIn, userId]);

  return (
    <SubscriptionStatusContext.Provider value={snapshot}>
      {children}
    </SubscriptionStatusContext.Provider>
  );
}

export function useSubscriptionStatusContext(): SubscriptionStoreSnapshot {
  const value = useContext(SubscriptionStatusContext);
  if (value === null) {
    throw new Error(
      'useStripeSubscription debe usarse dentro de <SubscriptionStatusProvider>'
    );
  }
  return value;
}
