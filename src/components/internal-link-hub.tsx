'use client';

import { ClientLink } from '@/components/client-link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { InternalLinkNode } from '@/lib/internal-link-graph';
import { cn } from '@/lib/utils';
import {
  ArrowRight,
  Globe,
  ImageIcon,
  LayoutGrid,
  Tag,
  Video,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

const ICON_BY_PATH: Record<string, React.ReactNode> = {
  '/prompts': <LayoutGrid className="h-5 w-5" />,
  '/image-prompts': <ImageIcon className="h-5 w-5" />,
  '/video-prompts': <Video className="h-5 w-5" />,
  '/landing-pages': <Globe className="h-5 w-5" />,
  '/image-tags': <Tag className="h-5 w-5" />,
  '/video-tags': <Tag className="h-5 w-5" />,
  '/web-tags': <Globe className="h-5 w-5" />,
};

type InternalLinkHubProps = {
  title: string;
  subtitle?: string;
  /** Nodos tier 1 (tarjetas principales). */
  primaryLinks: InternalLinkNode[];
  /** Nodos tier 2–3 (enlaces secundarios). */
  secondaryLinks?: InternalLinkNode[];
  className?: string;
  variant?: 'full' | 'compact';
};

export function InternalLinkHub({
  title,
  subtitle,
  primaryLinks,
  secondaryLinks = [],
  className,
  variant = 'full',
}: InternalLinkHubProps) {
  const t = useTranslations();

  if (variant === 'compact') {
    return (
      <nav
        className={cn('rounded-lg border bg-muted/30 p-4', className)}
        aria-label={title}
      >
        <p className="text-sm font-semibold font-headline mb-3">{title}</p>
        <ul className="flex flex-wrap gap-2">
          {[...primaryLinks, ...secondaryLinks].map(link => (
            <li key={link.path}>
              <Button variant="secondary" size="sm" asChild>
                <ClientLink href={link.path}>{t(link.labelKey)}</ClientLink>
              </Button>
            </li>
          ))}
        </ul>
      </nav>
    );
  }

  return (
    <section className={cn('w-full py-8 md:py-12', className)} aria-labelledby="link-hub-title">
      <LinkHubHeader title={title} subtitle={subtitle} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {primaryLinks.map(link => (
          <ClientLink key={link.path} href={link.path} className="group block h-full">
            <Card className="h-full transition-shadow hover:shadow-md hover:border-primary/30">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="rounded-md bg-primary/10 p-2 text-primary">
                    {ICON_BY_PATH[link.path] ?? (
                      <LayoutGrid className="h-5 w-5" />
                    )}
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                </div>
                <CardTitle className="text-lg font-headline">
                  {t(link.labelKey)}
                </CardTitle>
                {link.descKey && (
                  <CardDescription>{t(link.descKey)}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground">
                  {t('internalLinks.exploreSection')}
                </p>
              </CardContent>
            </Card>
          </ClientLink>
        ))}
      </div>
      {secondaryLinks.length > 0 && (
        <nav
          className="mt-8 flex flex-wrap items-center justify-center gap-2 md:gap-3"
          aria-label={t('internalLinks.discoveryLabel')}
        >
          <span className="text-sm text-muted-foreground w-full text-center sm:w-auto sm:mr-2">
            {t('internalLinks.discoveryLabel')}:
          </span>
          {secondaryLinks.map(link => (
            <Button key={link.path} variant="outline" size="sm" asChild>
              <ClientLink href={link.path}>{t(link.labelKey)}</ClientLink>
            </Button>
          ))}
        </nav>
      )}
    </section>
  );
}

function LinkHubHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col items-center text-center space-y-2 mb-8 md:mb-10">
      <h2
        id="link-hub-title"
        className="text-2xl font-bold tracking-tighter sm:text-3xl font-headline"
      >
        {title}
      </h2>
      {subtitle && (
        <p className="max-w-[640px] text-muted-foreground md:text-lg">{subtitle}</p>
      )}
    </div>
  );
}
