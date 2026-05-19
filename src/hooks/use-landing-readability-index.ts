'use client';

import { fetchJsonWithLru } from '@/lib/client-lru-cache';
import type { LandingReadabilityPublicSnapshot } from '@/lib/landing-readability-store';
import type { Locale } from '@/i18n/config';
import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';

export function useLandingReadabilityIndex() {
  const locale = useLocale() as Locale;
  const [snapshots, setSnapshots] = useState<
    Record<string, LandingReadabilityPublicSnapshot>
  >({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    fetchJsonWithLru<{ snapshots?: Record<string, LandingReadabilityPublicSnapshot> }>(
      `/api/landing-pages/readability-index?locale=${locale}`
    )
      .then(data => {
        if (!cancelled) {
          setSnapshots(data.snapshots ?? {});
        }
      })
      .catch(() => {
        if (!cancelled) setSnapshots({});
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [locale]);

  return { snapshots, isLoading };
}
