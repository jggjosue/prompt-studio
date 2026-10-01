'use client';

import { useEffect } from 'react';
import { trackInterest } from '@/lib/interest-analytics';

export function InterestPageView({ page, program }: { page: string; program: string }) {
  useEffect(() => {
    trackInterest('program_page_view', { page, program });
  }, [page, program]);
  return null;
}
