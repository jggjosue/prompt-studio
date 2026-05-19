'use client';

import { useStripeSubscription } from '@/hooks/use-stripe-subscription';
import {
  buildCheckoutUrl,
  buildSignUpUrl,
  membershipRequiresPayment,
  normalizeMembership,
} from '@/lib/membership-access';
import type { ContentMembership } from '@/lib/membership-access';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export type AccessRequestResult = true | false | 'pending';

function stripeGrantsMembership(plan: string, required: ContentMembership): boolean {
  if (required === 'free') return true;
  if (plan === 'startup') return true;
  if (required === 'premium') return plan === 'premium';
  return false;
}

export function useMembershipAccess() {
  const { isLoaded, isSignedIn } = useAuth();
  const { plan, ready } = useStripeSubscription();
  const router = useRouter();

  const hasPaidPlan = plan === 'premium' || plan === 'startup';

  const canAccessMembership = useCallback(
    (membership?: string) => {
      if (!membershipRequiresPayment(membership)) return true;
      if (!ready) return false;
      return stripeGrantsMembership(plan, normalizeMembership(membership));
    },
    [plan, ready]
  );

  const requestAccess = useCallback(
    (membership?: string): AccessRequestResult => {
      if (!membershipRequiresPayment(membership)) return true;
      if (!isLoaded || !ready) return 'pending';

      const tier = normalizeMembership(membership);

      if (!isSignedIn) {
        router.push(buildSignUpUrl(buildCheckoutUrl({ plan: tier })));
        return false;
      }

      if (!stripeGrantsMembership(plan, tier)) {
        router.push(buildCheckoutUrl({ plan: tier }));
        return false;
      }

      return true;
    },
    [plan, ready, isLoaded, isSignedIn, router]
  );

  const runWithAccess = useCallback(
    (membership: string | undefined, action: () => void) => {
      const result = requestAccess(membership);
      if (result === true) action();
    },
    [requestAccess]
  );

  return {
    ready: isLoaded && ready,
    isSignedIn: Boolean(isSignedIn),
    plan,
    hasPaidPlan,
    canAccessMembership,
    requestAccess,
    runWithAccess,
  };
}
