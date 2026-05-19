'use client';

import type { SubscriptionStatusResponse } from '@/app/api/subscription/status/route';
import {
  clearSubscriptionStatusCache,
  getCachedSubscriptionStatus,
  loadSubscriptionStatus,
  subscribeSubscriptionStatus,
} from '@/lib/subscription-status-cache';
import { useAuth } from '@clerk/nextjs';
import { useCallback, useEffect, useSyncExternalStore } from 'react';

type State = SubscriptionStatusResponse & { ready: boolean };

const FREE_READY: State = {
  plan: 'free',
  status: null,
  currentPeriodEnd: null,
  billingCycle: null,
  ready: true,
};

const NOT_READY: State = {
  plan: 'free',
  status: null,
  currentPeriodEnd: null,
  billingCycle: null,
  ready: false,
};

function toState(
  data: SubscriptionStatusResponse,
  ready: boolean
): State {
  return { ...data, ready };
}

export function useStripeSubscription(): State {
  const { isLoaded, isSignedIn, userId } = useAuth();

  const subscribe = useCallback(
    (onStoreChange: () => void) =>
      subscribeSubscriptionStatus(onStoreChange),
    []
  );

  const getSnapshot = useCallback((): State => {
    if (!isLoaded) return NOT_READY;
    if (!isSignedIn || !userId) return FREE_READY;
    const cached = getCachedSubscriptionStatus(userId);
    if (cached) return toState(cached, true);
    return NOT_READY;
  }, [isLoaded, isSignedIn, userId]);

  const getServerSnapshot = useCallback((): State => NOT_READY, []);

  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn || !userId) {
      clearSubscriptionStatusCache();
      return;
    }

    void loadSubscriptionStatus(userId);
  }, [isLoaded, isSignedIn, userId]);

  return snapshot;
}

/** Fuerza refetch (p. ej. tras volver del checkout de Stripe). */
export function useRefreshSubscriptionStatus(): () => void {
  const { isSignedIn, userId } = useAuth();
  return useCallback(() => {
    if (!isSignedIn || !userId) return;
    void loadSubscriptionStatus(userId, { force: true });
  }, [isSignedIn, userId]);
}
