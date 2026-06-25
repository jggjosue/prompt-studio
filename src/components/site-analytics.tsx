'use client';

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { getFirebaseAnalytics } from '@/lib/firebase';
import { useEffect } from 'react';

export function SiteAnalytics() {
  useEffect(() => {
    void getFirebaseAnalytics();
  }, []);

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
