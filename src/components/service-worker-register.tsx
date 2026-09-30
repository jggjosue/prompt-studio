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

        // Do not force a reload here. The worker is detached for subsequent
        // navigations, while reloading during a client transition duplicates
        // page loads and can leave lazy media blank when history is restored.
      } catch (err) {
        console.warn('[SW] Cleanup failed:', err);
      }
    };

    void removeLegacyWorkers();
  }, []);

  return null;
}
