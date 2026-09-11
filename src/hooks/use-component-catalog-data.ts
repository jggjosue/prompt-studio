'use client';

import { useEffect, useState } from 'react';

export type ComponentKind =
  | 'login'
  | 'header'
  | 'text'
  | 'form'
  | 'button'
  | 'card'
  | 'navigation'
  | 'sidebar';

export type ComponentCatalogEntry = {
  id: string;
  name: { en: string; es: string };
  description: { en: string; es: string };
  prompt: { en: string; es: string };
  preview: { primary?: string; secondary?: string; background?: string };
  stack: string[];
  tags: string[];
  membership: string;
};

export type ComponentCatalogSource = [ComponentKind, ComponentCatalogEntry[]];

const kinds: ComponentKind[] = [
  'login',
  'header',
  'text',
  'form',
  'button',
  'card',
  'navigation',
  'sidebar',
];

const catalogUrl = (kind: ComponentKind) =>
  '/catalog/components/web-' + kind + '-components.json';

export function useComponentCatalogData() {
  const [sources, setSources] = useState<ComponentCatalogSource[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    void Promise.all(
      kinds.map(async kind => {
        const response = await fetch(catalogUrl(kind), {
          cache: 'force-cache',
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('Catalog request failed: ' + response.status);
        const catalog = (await response.json()) as {
          components: ComponentCatalogEntry[];
        };
        return [kind, catalog.components] as ComponentCatalogSource;
      })
    )
      .then(setSources)
      .catch(value => {
        if ((value as Error).name !== 'AbortError') {
          setError('No pudimos cargar el catálogo de componentes.');
        }
      });

    return () => controller.abort();
  }, []);

  return { sources, loading: sources.length === 0 && !error, error };
}
