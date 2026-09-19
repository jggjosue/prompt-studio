'use client';

import { useSavedItems, type SavedItemInput } from '@/components/saved-items-provider';
import { cn } from '@/lib/utils';
import { useClerk } from '@clerk/nextjs';
import { Bookmark } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { memo, useState } from 'react';

type SaveItemButtonProps = SavedItemInput & {
  className?: string;
};

/**
 * Icono de guardar en la esquina de cada tarjeta del catálogo.
 *
 * Si el usuario ha iniciado sesión, alterna el estado guardado/favorito.
 * Si el usuario NO ha iniciado sesión, al hacer clic lo redirige a crear una cuenta (/sign-up).
 */
function SaveItemButtonComponent({ className, ...item }: SaveItemButtonProps) {
  const saved = useSavedItems();
  const clerk = useClerk();
  const pathname = usePathname();
  const t = useTranslations('saved');
  const [busy, setBusy] = useState(false);

  // Si aún está cargando la sesión o el estado inicial
  if (!saved || (saved.isSignedIn && saved.savedKeys === null)) return null;

  const isSaved = saved.isSignedIn ? saved.isSaved(item.itemKind, item.itemId) : false;

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

        if (!saved.isSignedIn) {
          clerk.redirectToSignUp({
            redirectUrl: pathname || '/my-components',
          });
          return;
        }

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

