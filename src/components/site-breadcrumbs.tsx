'use client';

import { ClientLink } from '@/components/client-link';
import { getBreadcrumbTrail } from '@/lib/internal-link-graph';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

type SiteBreadcrumbsProps = {
  pathname: string;
  className?: string;
};

/**
 * Migas de pan con enlaces ascendentes (flujo de autoridad hacia la home).
 */
export function SiteBreadcrumbs({ pathname, className }: SiteBreadcrumbsProps) {
  const t = useTranslations();
  const trail = useMemo(() => getBreadcrumbTrail(pathname), [pathname]);

  if (trail.length === 0) return null;

  const siteOrigin = 'https://www.prompstudio.com';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: t(crumb.labelKey),
      item: `${siteOrigin}${crumb.href}`,
    })),
  };

  return (
    <nav
      aria-label={t('internalLinks.breadcrumbLabel')}
      className={cn('text-sm text-muted-foreground', className)}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ol className="container flex flex-wrap items-center gap-1.5 py-2 min-h-9">
        {trail.map((crumb, i) => {
          const isLast = i === trail.length - 1;
          return (
            <li key={crumb.href} className="flex items-center gap-1.5">
              {i > 0 && (
                <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" aria-hidden />
              )}
              {isLast ? (
                <span className="font-medium text-foreground" aria-current="page">
                  {t(crumb.labelKey)}
                </span>
              ) : (
                <ClientLink
                  href={crumb.href}
                  className="hover:text-foreground transition-colors"
                >
                  {t(crumb.labelKey)}
                </ClientLink>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
