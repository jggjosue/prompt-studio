'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SaveItemButton } from '@/components/save-item-button';
import {
  savedKey,
  useSavedItems,
  type SavedItemRecord,
} from '@/components/saved-items-provider';
import { Bookmark } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { SavedItemKind } from '@/models/SavedItem';

const KIND_LABEL: Record<SavedItemKind, string> = {
  image: 'kindImage',
  video: 'kindVideo',
  'web-page': 'kindWebPage',
  component: 'kindComponent',
  animation: 'kindAnimation',
};

/**
 * Lista de recursos guardados, para el perfil.
 *
 * El proveedor solo mantiene el conjunto de claves —basta para pintar los
 * iconos del catálogo—, así que aquí se piden los registros completos. Se
 * recargan cuando cambia el conjunto: si el usuario quita algo desde esta misma
 * lista, desaparece sin recargar la página.
 */
export function SavedItemsPanel() {
  const t = useTranslations('saved');
  const saved = useSavedItems();
  const [items, setItems] = useState<SavedItemRecord[] | null>(null);

  const savedSignature = saved?.savedKeys
    ? [...saved.savedKeys].sort().join('|')
    : null;

  useEffect(() => {
    if (savedSignature === null) return;

    const controller = new AbortController();
    void fetch('/api/saved', { signal: controller.signal })
      .then(response => (response.ok ? response.json() : { items: [] }))
      .then((data: { items?: SavedItemRecord[] }) => setItems(data.items ?? []))
      .catch(() => setItems([]));

    return () => controller.abort();
  }, [savedSignature]);

  // Solo lo que sigue guardado: evita el parpadeo entre el borrado optimista
  // y la respuesta del servidor.
  const visible = useMemo(() => {
    if (!items) return null;
    if (!saved?.savedKeys) return items;
    return items.filter(item => saved.savedKeys!.has(savedKey(item.itemKind, item.itemId)));
  }, [items, saved?.savedKeys]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Bookmark className="h-5 w-5" aria-hidden="true" />
          {t('title')}
          {visible?.length ? (
            <span className="text-sm font-normal text-muted-foreground">
              ({visible.length})
            </span>
          ) : null}
        </CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        {visible === null ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {[0, 1, 2, 3].map(index => (
              <div key={index} className="h-20 animate-pulse rounded-md bg-muted" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('empty')}</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {visible.map(item => (
              <li
                key={savedKey(item.itemKind, item.itemId)}
                className="flex items-center gap-3 rounded-md border border-border/60 p-3"
              >
                {item.imageUrl ? (
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded">
                    <Image
                      src={item.imageUrl}
                      alt=""
                      fill
                      sizes="56px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="h-14 w-14 shrink-0 rounded bg-muted" />
                )}

                <div className="min-w-0 flex-1">
                  <Link
                    href={item.href}
                    className="block truncate text-sm font-medium hover:underline"
                  >
                    {item.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {t(KIND_LABEL[item.itemKind] ?? 'kindImage')}
                  </p>
                </div>

                <SaveItemButton
                  itemKind={item.itemKind}
                  itemId={item.itemId}
                  title={item.title}
                  href={item.href}
                  imageUrl={item.imageUrl}
                />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
