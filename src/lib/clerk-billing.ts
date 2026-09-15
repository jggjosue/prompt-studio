import type { ContentMembership } from '@/lib/membership-access';

/**
 * Slugs must match Clerk Dashboard → Billing → Plans for Users.
 * @see https://clerk.com/docs/nextjs/guides/billing/for-b2c
 */
export const CLERK_USER_PLANS = {
  premium: 'premium',
  pro: 'pro',
  startup: 'startup',
} as const;

/** Optional Features attached to plans in the Clerk Dashboard. */
export const CLERK_FEATURES = {
  premiumAccess: 'premium_access',
  proAccess: 'pro_access',
  startupAccess: 'startup_access',
} as const;

export type ClerkHasFn = (params: {
  plan?: string;
  feature?: string;
  permission?: string;
  role?: string;
}) => boolean;

export function clerkGrantsMembership(
  has: ClerkHasFn | undefined,
  isSignedIn: boolean,
  required: ContentMembership
): boolean {
  if (required === 'free') return true;
  if (!isSignedIn || !has) return false;

  const hasPremium =
    has({ plan: CLERK_USER_PLANS.premium }) ||
    has({ feature: CLERK_FEATURES.premiumAccess });

  const hasPro =
    has({ plan: CLERK_USER_PLANS.pro }) ||
    has({ feature: CLERK_FEATURES.proAccess });

  const hasStartup =
    has({ plan: CLERK_USER_PLANS.startup }) ||
    has({ feature: CLERK_FEATURES.startupAccess });

  if (required === 'premium') {
    return hasPremium || hasPro || hasStartup;
  }

  return hasStartup;
}

export function activeClerkPlanLabel(
  has: ClerkHasFn | undefined,
  isSignedIn: boolean
): 'free' | 'premium' | 'pro' | 'startup' {
  if (!isSignedIn || !has) return 'free';
  if (
    has({ plan: CLERK_USER_PLANS.startup }) ||
    has({ feature: CLERK_FEATURES.startupAccess })
  ) {
    return 'startup';
  }
  if (
    has({ plan: CLERK_USER_PLANS.pro }) ||
    has({ feature: CLERK_FEATURES.proAccess })
  ) {
    return 'pro';
  }
  if (
    has({ plan: CLERK_USER_PLANS.premium }) ||
    has({ feature: CLERK_FEATURES.premiumAccess })
  ) {
    return 'premium';
  }
  return 'free';
}
