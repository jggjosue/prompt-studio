'use client';

import { MembershipBadge } from '@/components/membership-badge';
import { SaveItemButton } from '@/components/save-item-button';
import type { SavedItemInput } from '@/components/saved-items-provider';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { memo } from 'react';

type PromptCatalogCardHeaderProps = {
  title: string;
  membership?: string;
  className?: string;
  titleClassName?: string;
  /** Sin esto no se pinta el icono de guardar: no todas las tarjetas lo quieren. */
  saveItem?: SavedItemInput;
};

function PromptCatalogCardHeaderComponent({
  title,
  membership,
  className,
  titleClassName,
  saveItem,
}: PromptCatalogCardHeaderProps) {
  return (
    <CardHeader className={cn('p-4 sm:p-6', className)}>
      <div className="flex items-start justify-between gap-3">
        <CardTitle
          className={cn('font-headline text-lg sm:text-xl min-w-0', titleClassName)}
        >
          {title}
        </CardTitle>
        <div className="flex shrink-0 items-center gap-1">
          <MembershipBadge membership={membership} size="sm" />
          {saveItem ? <SaveItemButton {...saveItem} /> : null}
        </div>
      </div>
    </CardHeader>
  );
}

export const PromptCatalogCardHeader = memo(PromptCatalogCardHeaderComponent);
