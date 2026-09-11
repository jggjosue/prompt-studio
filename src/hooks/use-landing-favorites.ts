'use client';

import type { WebPageEntry } from '@/lib/web-pages';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'prompt-studio:landing-favorites:v1';
const CHANGE_EVENT = 'prompt-studio:landing-favorites-change';

export type LandingFavorite = Pick<
  WebPageEntry,
  'demoUrl' | 'id' | 'imageUrl' | 'price' | 'title'
>;

function readFavorites(): LandingFavorite[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeFavorites(favorites: LandingFavorite[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useLandingFavorites() {
  const [favorites, setFavorites] = useState<LandingFavorite[]>([]);

  useEffect(() => {
    const update = () => setFavorites(readFavorites());
    update();
    window.addEventListener(CHANGE_EVENT, update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener(CHANGE_EVENT, update);
      window.removeEventListener('storage', update);
    };
  }, []);

  const toggleFavorite = useCallback((page: WebPageEntry) => {
    const current = readFavorites();
    const exists = current.some(item => item.demoUrl === page.demoUrl);
    writeFavorites(
      exists
        ? current.filter(item => item.demoUrl !== page.demoUrl)
        : [
            ...current,
            {
              demoUrl: page.demoUrl,
              id: page.id,
              imageUrl: page.imageUrl,
              price: page.price,
              title: page.title,
            },
          ]
    );
  }, []);

  const removeFavorite = useCallback((demoUrl: string) => {
    writeFavorites(readFavorites().filter(item => item.demoUrl !== demoUrl));
  }, []);

  return { favorites, toggleFavorite, removeFavorite };
}
