import { normalizeMembership } from '@/lib/membership-access';

export function canCopyLandingPrompt({
  membership,
  hasPaidPlan,
  hasPurchased,
}: {
  membership?: string;
  hasPaidPlan: boolean;
  hasPurchased: boolean;
}): boolean {
  return normalizeMembership(membership) === 'free' || hasPaidPlan || hasPurchased;
}

export function needsLandingPromptEmailGate({
  membership,
  isSignedIn,
}: {
  membership?: string;
  isSignedIn: boolean;
}): boolean {
  return normalizeMembership(membership) === 'free' && !isSignedIn;
}
