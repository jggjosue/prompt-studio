'use client';

import { useAuth } from '@clerk/nextjs';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { SavedItemKind } from '@/models/SavedItem';

export type SavedItemInput = {
  itemKind: SavedItemKind;
  itemId: string;
  title: string;
  href: string;
  imageUrl?: string | null;
};

export type SavedItemRecord = SavedItemInput & { createdAt: string };

type SavedItemsContextValue = {
  /** `null` mientras se carga: permite no pintar el icono en estado falso. */
  savedKeys: Set<string> | null;
  isSignedIn: boolean;
  isSaved: (kind: SavedItemKind, id: string) => boolean;
  toggle: (item: SavedItemInput) => Promise<void>;
};

const SavedItemsContext = createContext<SavedItemsContextValue | null>(null);

/** Clave compuesta: `itemId` no es único entre tipos (existen `img-2` y `wp-2`). */
export const savedKey = (kind: SavedItemKind, id: string) => `${kind}:${id}`;

/**
 * Carga **una sola vez** el conjunto de recursos guardados por el usuario y lo
 * comparte con todas las tarjetas de la página.
 *
 * La alternativa —que cada tarjeta consulte su estado— produciría decenas de
 * peticiones en una cuadrícula de catálogo. Aquí es una sola, y las tarjetas
 * solo leen de un `Set` en memoria.
 */
export function SavedItemsProvider({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const [savedKeys, setSavedKeys] = useState<Set<string> | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setSavedKeys(new Set());
      return;
    }

    const controller = new AbortController();
    void fetch('/api/saved', { signal: controller.signal })
      .then(response => (response.ok ? response.json() : { items: [] }))
      .then((data: { items?: SavedItemRecord[] }) => {
        setSavedKeys(
          new Set((data.items ?? []).map(item => savedKey(item.itemKind, item.itemId)))
        );
      })
      .catch(() => {
        // Un fallo de red no debe romper el catálogo: se asume nada guardado.
        setSavedKeys(new Set());
      });

    return () => controller.abort();
  }, [isLoaded, isSignedIn]);

  const isSaved = useCallback(
    (kind: SavedItemKind, id: string) => savedKeys?.has(savedKey(kind, id)) ?? false,
    [savedKeys]
  );

  const toggle = useCallback(
    async (item: SavedItemInput) => {
      if (!isSignedIn) return;

      const key = savedKey(item.itemKind, item.itemId);
      const wasSaved = savedKeys?.has(key) ?? false;

      // Optimista: el icono responde al instante y se revierte si el servidor falla.
      setSavedKeys(previous => {
        const next = new Set(previous ?? []);
        if (wasSaved) next.delete(key);
        else next.add(key);
        return next;
      });

      try {
        const response = await fetch('/api/saved', {
          method: wasSaved ? 'DELETE' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });
        if (!response.ok) throw new Error(String(response.status));
      } catch {
        setSavedKeys(previous => {
          const next = new Set(previous ?? []);
          if (wasSaved) next.add(key);
          else next.delete(key);
          return next;
        });
      }
    },
    [isSignedIn, savedKeys]
  );

  const value = useMemo(
    () => ({ savedKeys, isSignedIn: Boolean(isSignedIn), isSaved, toggle }),
    [savedKeys, isSignedIn, isSaved, toggle]
  );

  return <SavedItemsContext.Provider value={value}>{children}</SavedItemsContext.Provider>;
}

/** `null` si el proveedor no envuelve al componente: permite degradar sin romper. */
export function useSavedItems(): SavedItemsContextValue | null {
  return useContext(SavedItemsContext);
}
