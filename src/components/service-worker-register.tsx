'use client';

import { useEffect } from 'react';

/**
 * Registra el Service Worker en producción (caché Cache-First / SWR / Network-First).
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    if (process.env.NODE_ENV !== 'production') {
      const clearDevelopmentWorker = async () => {
        try {
          const registrations =
            await navigator.serviceWorker.getRegistrations();
          await Promise.all(
            registrations
              .filter(registration =>
                registration.active?.scriptURL.endsWith('/sw.js')
              )
              .map(registration => registration.unregister())
          );

          if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(
              cacheNames
                .filter(cacheName => cacheName.startsWith('ps-cache-'))
                .map(cacheName => caches.delete(cacheName))
            );
          }
        } catch (err) {
          console.warn('[SW] Development cleanup failed:', err);
        }
      };

      void clearDevelopmentWorker();
      return;
    }

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
