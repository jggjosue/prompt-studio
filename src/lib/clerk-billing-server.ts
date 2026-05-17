import { auth } from '@clerk/nextjs/server';
import { clerkGrantsMembership } from '@/lib/clerk-billing';
import {
  membershipRequiresPayment,
  normalizeMembership,
} from '@/lib/membership-access';

export async function hasMembershipAccess(membership?: string): Promise<boolean> {
  const tier = normalizeMembership(membership);
  if (!membershipRequiresPayment(membership)) return true;

  const { isAuthenticated, has } = await auth();
  if (!isAuthenticated) return false;

  return clerkGrantsMembership(has, true, tier);
}
