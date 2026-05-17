'use client';

import {
  activeClerkPlanLabel,
  clerkGrantsMembership,
} from '@/lib/clerk-billing';
import {
  buildCheckoutUrl,
  buildSignUpUrl,
  membershipRequiresPayment,
  normalizeMembership,
} from '@/lib/membership-access';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export type AccessRequestResult = true | false | 'pending';

export function useMembershipAccess() {
  const { isLoaded, isSignedIn, has } = useAuth();
  const router = useRouter();

  const plan = activeClerkPlanLabel(has, Boolean(isSignedIn));
  const hasPaidPlan = plan === 'premium' || plan === 'startup';

  const canAccessMembership = useCallback(
    (membership?: string) => {
      if (!membershipRequiresPayment(membership)) return true;
      if (!isLoaded) return false;
      return clerkGrantsMembership(has, Boolean(isSignedIn), normalizeMembership(membership));
    },
    [has, isLoaded, isSignedIn]
  );

  const requestAccess = useCallback(
    (membership?: string): AccessRequestResult => {
      if (!membershipRequiresPayment(membership)) return true;
      if (!isLoaded) return 'pending';

      const tier = normalizeMembership(membership);

      if (!isSignedIn) {
        router.push(buildSignUpUrl(buildCheckoutUrl({ plan: tier })));
        return false;
      }

      if (!clerkGrantsMembership(has, true, tier)) {
        router.push(buildCheckoutUrl({ plan: tier }));
        return false;
      }

      return true;
    },
    [has, isLoaded, isSignedIn, router]
  );

  const runWithAccess = useCallback(
    (membership: string | undefined, action: () => void) => {
      const result = requestAccess(membership);
      if (result === true) action();
    },
    [requestAccess]
  );

  return {
    ready: isLoaded,
    isSignedIn: Boolean(isSignedIn),
    plan,
    hasPaidPlan,
    canAccessMembership,
    requestAccess,
    runWithAccess,
  };
}
