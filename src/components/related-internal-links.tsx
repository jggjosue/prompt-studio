'use client';

import { InternalLinkHub } from '@/components/internal-link-hub';
import { getRelatedHubLinks } from '@/lib/internal-link-graph';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

type RelatedInternalLinksProps = {
  className?: string;
};

/** Bloque compacto de interlinking contextual (autoridad lateral entre hubs). */
export function RelatedInternalLinks({ className }: RelatedInternalLinksProps) {
  const pathname = usePathname();
  const t = useTranslations('internalLinks');
  const links = useMemo(() => getRelatedHubLinks(pathname, 6), [pathname]);

  if (links.length === 0) return null;

  return (
    <InternalLinkHub
      variant="compact"
      className={className}
      title={t('relatedTitle')}
      primaryLinks={links}
    />
  );
}
