'use client';

import { trackAnalyticsEvent } from '@/lib/analytics';

const ANONYMOUS_ID_KEY = 'promptstudio:analytics:anonymous-id:v1';
const IDENTITY_LINK_KEY = 'promptstudio:analytics:identity-linked:v1';

export function getOrCreateAnonymousAnalyticsId(): string | null {
  if (typeof window === 'undefined') return null;
  let value = window.localStorage.getItem(ANONYMOUS_ID_KEY);
  if (value) return value;
  value = crypto.randomUUID();
  window.localStorage.setItem(ANONYMOUS_ID_KEY, value);
  return value;
}

/**
 * Links the pre-registration browser journey to the completed signup without
 * exposing the Clerk user id or profile data to analytics.
 *
 * The anonymous id is random and first-party. It is rotated immediately after
 * the one-time link event so it cannot become a durable authenticated user id.
 */
export function linkAnonymousJourneyAfterSignup(): void {
  if (typeof window === 'undefined') return;
  if (window.sessionStorage.getItem(IDENTITY_LINK_KEY)) return;

  const anonymousId = getOrCreateAnonymousAnalyticsId();
  if (!anonymousId) return;

  trackAnalyticsEvent('identity_linked', {
    anonymous_id: anonymousId,
    action_source: 'clerk_sign_up',
    auth_state: 'authenticated',
  }, { idempotencyKey: anonymousId });

  window.sessionStorage.setItem(IDENTITY_LINK_KEY, '1');
  window.localStorage.removeItem(ANONYMOUS_ID_KEY);
}
