'use client';

import type { ImagePlaceholder } from '@/lib/placeholder-images';
import type { VideoProp } from '@/lib/placeholder-videos';
import type { WebPageEntry } from '@/lib/web-pages';
import { useLocale } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';

type CatalogKind = 'images' | 'videos' | 'web-pages';
type CatalogItem = ImagePlaceholder | VideoProp | WebPageEntry;
type CatalogResponse<T> = { items: T[]; total: number; nextOffset: number | null };

function usePagedCatalog<T extends CatalogItem>(kind: CatalogKind): T[] {
  const locale = useLocale().toLowerCase().startsWith('es') ? 'es' : 'en';
  const [items, setItems] = useState<T[]>([]);
  const nextOffset = useRef<number | null>(0);
  const loading = useRef(false);

  const loadMore = useCallback(async () => {
    if (loading.current || nextOffset.current === null) return;
    loading.current = true;
    const offset = nextOffset.current;
    try {
      const response = await fetch(`/api/catalog/${kind}?locale=${locale}&offset=${offset}&limit=24`);
      if (!response.ok) throw new Error(`Catalog request failed: ${response.status}`);
      const page = await response.json() as CatalogResponse<T>;
      setItems(current => offset === 0 ? page.items : [...current, ...page.items]);
      nextOffset.current = page.nextOffset;
    } catch (error) {
      nextOffset.current = null;
      console.error('Unable to load catalog page', error);
    } finally {
      loading.current = false;
    }
  }, [kind, locale]);

  useEffect(() => {
    setItems([]);
    nextOffset.current = 0;
    void loadMore();
  }, [loadMore]);

  useEffect(() => {
    const checkPosition = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1400) void loadMore();
    };
    window.addEventListener('scroll', checkPosition, { passive: true });
    const timer = window.setInterval(checkPosition, 800);
    return () => {
      window.removeEventListener('scroll', checkPosition);
      window.clearInterval(timer);
    };
  }, [loadMore]);

  return items;
}

export const usePagedPlaceholderImages = () => usePagedCatalog<ImagePlaceholder>('images');
export const usePagedPlaceholderVideos = () => usePagedCatalog<VideoProp>('videos');
export const usePagedWebPages = () => usePagedCatalog<WebPageEntry>('web-pages');
