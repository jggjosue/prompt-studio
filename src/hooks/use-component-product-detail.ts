'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';

type ComponentDetail = { id: string; kind: string; name: string; description: string; prompt: string; stack: string[]; tags: string[]; membership: string; price: number };

export function useComponentProductDetail(id: string) {
  const locale = useLocale().toLowerCase().startsWith('en') ? 'en' : 'es';
  const [detail, setDetail] = useState<ComponentDetail | null>(null);
  const [locked, setLocked] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    setDetail(null); setLocked(false);
    void fetch(`/api/catalog/components/${encodeURIComponent(id)}?locale=${locale}`, { cache: 'no-store', signal: controller.signal })
      .then(async response => {
        const payload = await response.json() as { locked?: boolean; product?: ComponentDetail };
        if (response.status === 403) { setLocked(true); return; }
        if (!response.ok || !payload.product) throw new Error(`Component detail failed: ${response.status}`);
        setDetail(payload.product);
      })
      .catch(error => { if ((error as Error).name !== 'AbortError') console.error(error); });
    return () => controller.abort();
  }, [id, locale]);
  return { detail, locked };
}
