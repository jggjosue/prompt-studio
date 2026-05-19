'use client';

import type { SubscriptionStatusResponse } from '@/app/api/subscription/status/route';
import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

type State = SubscriptionStatusResponse & { ready: boolean };

const DEFAULT: State = { plan: 'free', status: null, currentPeriodEnd: null, billingCycle: null, ready: false };

export function useStripeSubscription(): State {
  const { isLoaded, isSignedIn } = useAuth();
  const [state, setState] = useState<State>(DEFAULT);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setState({ plan: 'free', status: null, currentPeriodEnd: null, billingCycle: null, ready: true });
      return;
    }

    fetch('/api/subscription/status')
      .then((res) => res.json())
      .then((data: SubscriptionStatusResponse) => setState({ ...data, ready: true }))
      .catch(() => setState({ plan: 'free', status: null, currentPeriodEnd: null, billingCycle: null, ready: true }));
  }, [isLoaded, isSignedIn]);

  return state;
}
