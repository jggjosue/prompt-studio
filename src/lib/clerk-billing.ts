import type { ContentMembership } from '@/lib/membership-access';

export const CLERK_USER_PLANS = {
  creator: 'creator',
  pro: 'pro',
  studio: 'studio',
} as const;

export const CLERK_FEATURES = {
  creatorAccess: 'creator_access',
  proAccess: 'pro_access',
  studioAccess: 'studio_access',
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

  const hasCreator =
    has({ plan: CLERK_USER_PLANS.creator }) ||
    has({ feature: CLERK_FEATURES.creatorAccess });

  const hasPro =
    has({ plan: CLERK_USER_PLANS.pro }) ||
    has({ feature: CLERK_FEATURES.proAccess });

  const hasStudio =
    has({ plan: CLERK_USER_PLANS.studio }) ||
    has({ feature: CLERK_FEATURES.studioAccess });

  if (required === 'creator') {
    return hasCreator || hasPro || hasStudio;
  }

  if (required === 'pro') {
    return hasPro || hasStudio;
  }

  return hasStudio;
}

export function activeClerkPlanLabel(
  has: ClerkHasFn | undefined,
  isSignedIn: boolean
): 'free' | 'creator' | 'pro' | 'studio' {
  if (!isSignedIn || !has) return 'free';
  if (
    has({ plan: CLERK_USER_PLANS.studio }) ||
    has({ feature: CLERK_FEATURES.studioAccess })
  ) {
    return 'studio';
  }
  if (
    has({ plan: CLERK_USER_PLANS.pro }) ||
    has({ feature: CLERK_FEATURES.proAccess })
  ) {
    return 'pro';
  }
  if (
    has({ plan: CLERK_USER_PLANS.creator }) ||
    has({ feature: CLERK_FEATURES.creatorAccess })
  ) {
    return 'creator';
  }
  return 'free';
}
