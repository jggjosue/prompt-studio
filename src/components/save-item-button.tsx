'use client';

import { useSavedItems, type SavedItemInput } from '@/components/saved-items-provider';
import { cn } from '@/lib/utils';
import { Bookmark } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { memo, useState } from 'react';

type SaveItemButtonProps = SavedItemInput & {
  className?: string;
};

/**
 * Icono de guardar en la esquina de cada tarjeta del catálogo.
 *
 * No se pinta si el usuario no ha iniciado sesión: un botón que al pulsarlo
 * solo dice «inicia sesión» añade ruido a una cuadrícula de 24 tarjetas. La
 * llamada a la API igualmente exige sesión, así que esto es presentación, no
 * autorización.
 */
function SaveItemButtonComponent({ className, ...item }: SaveItemButtonProps) {
  const saved = useSavedItems();
  const t = useTranslations('saved');
  const [busy, setBusy] = useState(false);

  // Sin proveedor, sin sesión, o mientras carga el estado inicial: nada.
  if (!saved || !saved.isSignedIn || saved.savedKeys === null) return null;

  const isSaved = saved.isSaved(item.itemKind, item.itemId);

  return (
    <button
      type="button"
      aria-pressed={isSaved}
      aria-label={isSaved ? t('remove') : t('add')}
      title={isSaved ? t('remove') : t('add')}
      disabled={busy}
      onClick={async event => {
        // La tarjeta entera suele ser un enlace: sin esto, guardar navega.
        event.preventDefault();
        event.stopPropagation();
        setBusy(true);
        await saved.toggle(item);
        setBusy(false);
      }}
      className={cn(
        'shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors',
        'hover:bg-accent hover:text-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:opacity-50',
        isSaved && 'text-primary',
        className
      )}
    >
      <Bookmark className={cn('h-4 w-4', isSaved && 'fill-current')} aria-hidden="true" />
    </button>
  );
}

export const SaveItemButton = memo(SaveItemButtonComponent);
