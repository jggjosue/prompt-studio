'use client';

import { MembershipBadge } from '@/components/membership-badge';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { memo } from 'react';

type PromptCatalogCardHeaderProps = {
  title: string;
  membership?: string;
  className?: string;
  titleClassName?: string;
};

function PromptCatalogCardHeaderComponent({
  title,
  membership,
  className,
  titleClassName,
}: PromptCatalogCardHeaderProps) {
  return (
    <CardHeader className={cn('p-4 sm:p-6', className)}>
      <div className="flex items-start justify-between gap-3">
        <CardTitle
          className={cn('font-headline text-lg sm:text-xl min-w-0', titleClassName)}
        >
          {title}
        </CardTitle>
        <MembershipBadge membership={membership} size="sm" />
      </div>
    </CardHeader>
  );
}

export const PromptCatalogCardHeader = memo(PromptCatalogCardHeaderComponent);
