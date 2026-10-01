'use client';

import { useEffect } from 'react';

/**
 * Medición anónima para sitios publicados: un id efímero en sessionStorage,
 * pageview y clicks en CTA. No utiliza cookies de marketing ni recoge PII.
 */
function visitorId(): string {
  const key = 'ps_site_analytics_visitor';
  const existing = sessionStorage.getItem(key);
  if (existing) return existing;
  const next = crypto.randomUUID();
  sessionStorage.setItem(key, next);
  return next;
}

function emit(kind: 'page_view' | 'cta_click' | 'form_conversion') {
  const payload = JSON.stringify({ kind, page: window.location.pathname, visitorId: visitorId() });
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/page-composer/analytics/track', new Blob([payload], { type: 'application/json' }));
  } else {
    void fetch('/api/page-composer/analytics/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true });
  }
}

export function PublishedSiteAnalytics() {
  useEffect(() => {
    emit('page_view');
    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (target?.closest('a, button')) emit('cta_click');
    };
    const onFormConversion = () => emit('form_conversion');
    document.addEventListener('click', onClick);
    window.addEventListener('ps-form-conversion', onFormConversion);
    return () => {
      document.removeEventListener('click', onClick);
      window.removeEventListener('ps-form-conversion', onFormConversion);
    };
  }, []);
  return null;
}
