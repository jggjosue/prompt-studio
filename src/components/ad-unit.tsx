'use client';

import { useEffect, useRef } from 'react';

export function AdUnit() {
  const adPushed = useRef(false);

  useEffect(() => {
    if (!adPushed.current) {
      adPushed.current = true;
      try {
        // @ts-expect-error Google AdSense
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) { }
    }
  }, []);

  return (
    <div className="mt-3 h-[50px] w-full overflow-hidden">
      <ins className="adsbygoogle"
        style={{ display: 'block', height: '50px', width: '100%' }}
        data-ad-format="fluid"
        data-ad-layout-key="+2d+rx+1+2-3"
        data-ad-client="ca-pub-7082864972330769"
        data-ad-slot="3036660209"></ins>
    </div>
  );
}
