'use client';

import { ClientLink } from '@/components/client-link';
import { getBreadcrumbTrail } from '@/lib/internal-link-graph';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { safeJsonLd } from '@/lib/json-ld';
import { SITE_URL } from '@/lib/site-url';

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
  const breadcrumbLabel = (labelKey: string) => labelKey;
  const pathOnly = pathname.split('?')[0] ?? pathname;
  // Estas fichas emiten en servidor un BreadcrumbList más específico que
  // incluye el nombre real del recurso. La navegación visual se conserva,
  // pero no se publica un segundo grafo contradictorio desde el header.
  const hasPageOwnedBreadcrumbSchema = /^\/(?:landing-pages|gallery|gallery-videos)\/[^/]+\/?$/.test(pathOnly);

  if (trail.length === 0) return null;

  const siteOrigin = SITE_URL;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: t(breadcrumbLabel(crumb.labelKey)),
      item: `${siteOrigin}${crumb.href}`,
    })),
  };

  return (
    <nav
      aria-label={t('internalLinks.breadcrumbLabel')}
      className={cn('text-sm text-muted-foreground', className)}
    >
      {!hasPageOwnedBreadcrumbSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
        />
      ) : null}
      <ol className="container flex flex-wrap items-center gap-1.5 py-2 min-h-9">
        {trail.map((crumb, i) => {
          const isLast = i === trail.length - 1;
          return (
            <li key={`${crumb.href}-${i}`} className="flex items-center gap-1.5">
              {i > 0 && (
                <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" aria-hidden />
              )}
              {isLast ? (
                <span className="font-medium text-foreground" aria-current="page">
                  {t(breadcrumbLabel(crumb.labelKey))}
                </span>
              ) : (
                <ClientLink
                  href={crumb.href}
                  className="hover:text-foreground transition-colors"
                >
                  {t(breadcrumbLabel(crumb.labelKey))}
                </ClientLink>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
