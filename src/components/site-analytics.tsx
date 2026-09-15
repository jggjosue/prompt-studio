'use client';

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { getFirebaseAnalytics } from '@/lib/firebase';
import { trackAnalyticsEvent } from '@/lib/analytics';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { ObservabilityReporter } from '@/components/observability-reporter';

export function SiteAnalytics() {
  const pathname = usePathname();
  useEffect(() => {
    void getFirebaseAnalytics();
  }, []);

  useEffect(() => {
    const category = pathname.match(/^\/(login|header|text|form|button|card|navigation|sidebar)-components/)?.[1];
    const productArea = pathname.match(/^\/(component-builder|page-composer|smart-search|component-kits|component-compare|my-components|code-auditor)/)?.[1];
    const pageId = category ?? productArea;
    if (!pageId) return;
    const key = `analytics-page:${pathname}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    trackAnalyticsEvent('component_category_view', {
      page_id: pageId,
      item_category: category ?? 'component-tools',
      page_path: pathname,
    });
  }, [pathname]);

  return (
    <>
      <Analytics />
      <SpeedInsights />
      <ObservabilityReporter />
    </>
  );
}
