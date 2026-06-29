'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect } from 'react';
import { trackAffiliateClick } from '@/lib/affiliate-client';

export function AffiliatePageViewTracker({
  productId,
  productName,
  productPriceCents,
}: {
  productId: string;
  productName: string;
  productPriceCents: number | null;
}) {
  const { userId, isLoaded } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;

    void trackAffiliateClick({
      productId,
      productName,
      productPriceCents,
      source: 'landing-page',
      buyerKey: userId,
    });
  }, [isLoaded, productId, productName, productPriceCents, userId]);

  return null;
}
