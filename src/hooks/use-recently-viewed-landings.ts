'use client';

import { useEffect, useState } from 'react';

export const RECENT_LANDINGS_KEY = 'prompt-studio:recent-landings:v1';
export const PENDING_CHECKOUT_KEY = 'prompt-studio:pending-landing-checkout:v1';
const EVENT = 'prompt-studio:recent-landings-change';

export type RecentLanding = { slug: string; title: string; imageUrl: string; price: string; visits: number; lastViewedAt: string };

export function readRecentLandings(): RecentLanding[] {
  try {
    const value = JSON.parse(localStorage.getItem(RECENT_LANDINGS_KEY) ?? '[]');
    return Array.isArray(value) ? value : [];
  } catch { return []; }
}

export function rememberLanding(item: Omit<RecentLanding, 'visits' | 'lastViewedAt'>) {
  const current = readRecentLandings();
  const previous = current.find(entry => entry.slug === item.slug);
  const next = [{ ...item, visits: (previous?.visits ?? 0) + 1, lastViewedAt: new Date().toISOString() }, ...current.filter(entry => entry.slug !== item.slug)].slice(0, 8);
  localStorage.setItem(RECENT_LANDINGS_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(EVENT));
  return next[0];
}

export function useRecentlyViewedLandings() {
  const [items, setItems] = useState<RecentLanding[]>([]);
  useEffect(() => {
    const update = () => setItems(readRecentLandings());
    update();
    window.addEventListener(EVENT, update);
    window.addEventListener('storage', update);
    return () => { window.removeEventListener(EVENT, update); window.removeEventListener('storage', update); };
  }, []);
  return items;
}
