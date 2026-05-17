import type { BillingCycle, PlanId } from '@/lib/subscription-plans';

export const PROFILE_STORAGE_KEY = 'prompt-studio-profile';

export type StoredProfile = {
  plan: PlanId;
  billingCycle: BillingCycle;
  cardLast4?: string;
  cardBrand?: string;
  cardholderName?: string;
};

export function loadStoredProfile(): StoredProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredProfile) : null;
  } catch {
    return null;
  }
}

export function saveStoredProfile(data: StoredProfile) {
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(data));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('prompt-studio-profile-updated'));
  }
}

export function hasActivePaidPlan(plan: PlanId): boolean {
  return plan === 'premium' || plan === 'startup';
}
