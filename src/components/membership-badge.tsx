'use client';

import { Badge } from '@/components/ui/badge';
import { normalizeMembership } from '@/lib/membership-access';
import { cn } from '@/lib/utils';
import { Crown, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';

type MembershipBadgeProps = {
  membership?: string;
  className?: string;
  size?: 'sm' | 'default';
};

export function MembershipBadge({
  membership,
  className,
  size = 'default',
}: MembershipBadgeProps) {
  const t = useTranslations('common');
  const tier = normalizeMembership(membership);
  const compact = size === 'sm';

  if (tier === 'free') {
    return (
      <Badge
        variant="secondary"
        className={cn(
          'shrink-0 font-medium',
          compact && 'text-[10px] px-1.5 py-0',
          className
        )}
      >
        {t('free')}
      </Badge>
    );
  }

  if (tier === 'premium') {
    return (
      <Badge
        className={cn(
          'shrink-0 gap-1 bg-primary/90 text-primary-foreground hover:bg-primary/90 font-medium',
          compact && 'text-[10px] px-1.5 py-0',
          className
        )}
      >
        <Crown className={cn(compact ? 'h-3 w-3' : 'h-3.5 w-3.5')} />
        {t('premium')}
      </Badge>
    );
  }

  return (
    <Badge
      className={cn(
        'shrink-0 gap-1 bg-amber-600 text-white hover:bg-amber-600 font-medium',
        compact && 'text-[10px] px-1.5 py-0',
        className
      )}
    >
      <Sparkles className={cn(compact ? 'h-3 w-3' : 'h-3.5 w-3.5')} />
      {t('startup')}
    </Badge>
  );
}
