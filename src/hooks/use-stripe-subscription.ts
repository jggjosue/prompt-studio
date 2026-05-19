'use client';

import {
  useSubscriptionStatusContext,
} from '@/components/subscription-status-provider';
import {
  invalidateSubscriptionStatusCache,
  scheduleSubscriptionStatusLoad,
} from '@/lib/subscription-status-cache';
import type { SubscriptionStoreSnapshot } from '@/lib/subscription-status-cache';
import { useAuth } from '@clerk/nextjs';
import { useCallback } from 'react';

export type StripeSubscriptionState = SubscriptionStoreSnapshot;

/** Estado de suscripción compartido (un solo fetch / caché para toda la app). */
export function useStripeSubscription(): StripeSubscriptionState {
  return useSubscriptionStatusContext();
}

/** Fuerza refetch (p. ej. tras volver del checkout de Stripe). */
export function useRefreshSubscriptionStatus(): () => void {
  const { isSignedIn, userId } = useAuth();
  return useCallback(() => {
    if (!isSignedIn || !userId) return;
    invalidateSubscriptionStatusCache();
    void scheduleSubscriptionStatusLoad(userId, { force: true });
  }, [isSignedIn, userId]);
}
