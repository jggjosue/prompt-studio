'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useRef } from 'react';
import { trackAnalyticsEvent } from '@/lib/analytics';
import { linkAnonymousJourneyAfterSignup } from '@/lib/analytics-identity';

type AuthSurface = 'sign_in' | 'sign_up';

export function ClerkAuthAnalytics({ surface }: { surface: AuthSurface }) {
  const { isLoaded, isSignedIn } = useAuth();
  const started = useRef(false);
  const previousSignedIn = useRef<boolean | undefined>(undefined);

  useEffect(() => {
    if (!started.current) {
      started.current = true;
      if (surface === 'sign_up') {
        trackAnalyticsEvent('signup_started', {
          auth_source: 'clerk',
          auth_surface: surface,
          auth_state: 'anonymous',
        });
      }
    }
  }, [surface]);

  useEffect(() => {
    if (!isLoaded) return;
    const previous = previousSignedIn.current;
    previousSignedIn.current = isSignedIn;

    // Only count an authentication transition completed on this Clerk surface.
    // A user who simply revisits while already signed in is not a new signup/login.
    if (previous !== false || !isSignedIn) return;

    trackAnalyticsEvent(surface === 'sign_up' ? 'sign_up' : 'login', {
      method: 'clerk',
      auth_source: 'clerk',
      auth_surface: surface,
      auth_state: 'authenticated',
    });
    if (surface === 'sign_up') linkAnonymousJourneyAfterSignup();
  }, [isLoaded, isSignedIn, surface]);

  return null;
}
