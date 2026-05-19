'use client';

import { useEffect } from 'react';

/**
 * Registra el Service Worker en producción (caché Cache-First / SWR / Network-First).
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (!('serviceWorker' in navigator)) return;

    const register = async () => {
      try {
        await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });
      } catch (err) {
        console.warn('[SW] Registration failed:', err);
      }
    };

    if (document.readyState === 'complete') {
      void register();
    } else {
      window.addEventListener('load', register, { once: true });
    }
  }, []);

  return null;
}
