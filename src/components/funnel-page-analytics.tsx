'use client';

import { useAuth } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { trackAnalyticsEvent } from '@/lib/analytics';

export function FunnelPageAnalytics({ eventName }: { eventName: 'view_home' | 'view_pricing' }) {
  const pathname = usePathname();
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;
    trackAnalyticsEvent(eventName, {
      auth_state: isSignedIn ? 'authenticated' : 'anonymous',
      action_source: 'page_view',
    }, { oncePerSessionKey: pathname });
  }, [eventName, isLoaded, isSignedIn, pathname]);

  return null;
}
