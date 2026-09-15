'use client';

import { PENDING_CHECKOUT_KEY, rememberLanding } from '@/hooks/use-recently-viewed-landings';
import { trackAnalyticsEvent } from '@/lib/analytics';
import { RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';

type Props = { slug: string; title: string; imageUrl: string; price: string; locale: string };

export function PreviewIntentTracker({ slug, title, imageUrl, price, locale }: Props) {
  const [visits, setVisits] = useState(0);
  const [hasPendingCheckout, setHasPendingCheckout] = useState(false);
  useEffect(() => {
    const remembered = rememberLanding({ slug, title, imageUrl, price });
    setVisits(remembered.visits);
    trackAnalyticsEvent(remembered.visits > 1 ? 'web_return_to_product' : 'web_demo_view', {
      page_id: slug, page_title: title, item_id: slug, item_name: title,
      item_category: 'landing-page', value: Number(price) || undefined, currency: 'USD',
      action_source: 'full-demo-preview',
    });
    const checkPending = () => {
      try {
        const pending = JSON.parse(localStorage.getItem(PENDING_CHECKOUT_KEY) ?? 'null');
        const startedAt = Date.parse(pending?.startedAt ?? '');
        const isRecent = Number.isFinite(startedAt) && Date.now() - startedAt < 7 * 24 * 60 * 60 * 1000;
        setHasPendingCheckout(pending?.slug === slug && isRecent);
      } catch { setHasPendingCheckout(false); }
    };
    checkPending();
    document.addEventListener('visibilitychange', checkPending);
    window.addEventListener('storage', checkPending);
    return () => { document.removeEventListener('visibilitychange', checkPending); window.removeEventListener('storage', checkPending); };
  }, [slug, title, imageUrl, price]);
  if (visits < 2 && !hasPendingCheckout) return null;
  const message = hasPendingCheckout
    ? (locale === 'en' ? 'Your purchase is still waiting for you' : 'Tu compra sigue pendiente')
    : (locale === 'en' ? `You have viewed this template ${visits} times` : `Has visto esta plantilla ${visits} veces`);
  return <p className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-amber-300"><RotateCcw className="size-3" aria-hidden="true" />{message}</p>;
}
