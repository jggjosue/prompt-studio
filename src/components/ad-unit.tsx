'use client';

import { useEffect, useRef } from 'react';
import { useStripeSubscription } from '@/hooks/use-stripe-subscription';

export function AdUnit() {
  const adPushed = useRef(false);
  const { plan, ready } = useStripeSubscription();

  // Show ads only if the user is on the 'free' plan AND subscription status is fully loaded
  const showAds = ready && plan === 'free';

  useEffect(() => {
    if (showAds && !adPushed.current) {
      adPushed.current = true;
      try {
        // @ts-expect-error Google AdSense
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) { }
    }
  }, [showAds]);

  if (!showAds) return null;

  return (
    <div className="mt-3 h-[50px] w-full overflow-hidden">
      <ins className="adsbygoogle"
        style={{ display: 'block', height: '50px', width: '100%' }}
        data-ad-client="ca-pub-7082864972330769"
        data-ad-slot="2498438304"
        data-ad-format="fluid"
        data-full-width-responsive="true"></ins>
    </div>
  );
}
