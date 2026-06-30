'use client';

import { useEffect } from 'react';

/**
 * Elimina workers antiguos: mezclar HTML nuevo con chunks cacheados rompe la hidratación.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const removeLegacyWorkers = async () => {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        const hadRegistrations = registrations.length > 0;
        await Promise.all(
          registrations.map(registration => registration.unregister())
        );

        if ('caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(
            cacheNames
              .filter(cacheName => cacheName.startsWith('ps-cache-'))
              .map(cacheName => caches.delete(cacheName))
          );
        }

        const reloadKey = 'ps-sw-cleanup-reloaded';
        if (hadRegistrations && !window.sessionStorage.getItem(reloadKey)) {
          window.sessionStorage.setItem(reloadKey, '1');
          window.location.reload();
        }
      } catch (err) {
        console.warn('[SW] Cleanup failed:', err);
      }
    };

    void removeLegacyWorkers();
  }, []);

  return null;
}
