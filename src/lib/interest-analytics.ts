'use client';

import { track } from '@vercel/analytics';

export type InterestAnalyticsValue = string | number | boolean | null | undefined;

export function trackInterest(event: string, properties: Record<string, InterestAnalyticsValue> = {}) {
  const payload = {
    ...properties,
    path: typeof window === 'undefined' ? '' : window.location.pathname,
  };
  track(event, payload);
}
