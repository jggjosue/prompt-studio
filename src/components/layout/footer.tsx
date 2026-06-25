'use client';

import { useEffect, useState } from 'react';
import { ClientLink } from '@/components/client-link';
import { PromptEditLink } from '@/components/prompt-edit-link';
import { getFooterLinkGroups } from '@/lib/internal-link-graph';
import { useTranslations } from 'next-intl';
import { LanguageToggle } from '@/components/language-toggle';
import Logo from './logo';

const COPYRIGHT_YEAR = 2026;

export default function Footer() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const t = useTranslations('footer');
  const tRoot = useTranslations();
  const tLinks = useTranslations('internalLinks');

  const { primary, discovery, topical } = getFooterLinkGroups();
  const primaryLinks = primary.filter(
    link => link.path !== '/affiliate-program'
  );

  const legalLinks = [
    { href: '/terms', label: t('termsOfUse') },
    { href: '/privacy', label: t('privacyPolicy') },
    { href: '/affiliate-program-terms', label: t('affiliateTerms') },
  ];

  return (
    <footer className="border-t border-border/40 bg-background/50 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-16 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-6">
            <Logo />
            <p className="text-sm leading-6 text-muted-foreground max-w-xs">
              {t('tagline')}
            </p>
            <div className="flex space-x-6 text-muted-foreground">
              {/* Social links placeholder if any */}
            </div>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0 md:grid-cols-4">
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-foreground font-headline">
                {tLinks('footerPrimary')}
              </h4>
              <ul className="space-y-3">
                {primaryLinks.map(link => (
                  <li key={link.path}>
                    <PromptEditLink
                      href={link.path}
                      className="text-sm leading-6 hover:text-foreground transition-colors"
                    >
                      {tRoot(link.labelKey)}
                    </PromptEditLink>
                  </li>
                ))}
                <li>
                  <ClientLink
                    href="/affiliate-program"
                    className="inline-flex items-center gap-2 text-sm leading-6 hover:text-foreground transition-colors"
                  >
                    {t('affiliateProgram')}
                  </ClientLink>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-foreground font-headline">
                {tLinks('footerDiscovery')}
              </h4>
              <ul className="space-y-3">
                {discovery.map(link => (
                  <li key={link.path}>
                    <PromptEditLink
                      href={link.path}
                      className="text-sm leading-6 hover:text-foreground transition-colors"
                    >
                      {tRoot(link.labelKey)}
                    </PromptEditLink>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-foreground font-headline">
                {tLinks('footerTopics')}
              </h4>
              <ul className="space-y-3">
                {topical.map(link => (
                  <li key={link.path}>
                    <PromptEditLink
                      href={link.path}
                      className="text-sm leading-6 hover:text-foreground transition-colors"
                    >
                      {tRoot(link.labelKey)}
                    </PromptEditLink>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-foreground font-headline">
                {t('legal')}
              </h4>
              <ul className="space-y-3">
                {legalLinks.map(link => (
                  <li key={link.href}>
                    {link.href.startsWith('http') ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm leading-6 hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <ClientLink
                        href={link.href}
                        className="text-sm leading-6 hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </ClientLink>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-4 border-t border-border/70 pt-6 text-xs text-muted-foreground/80">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="max-w-2xl leading-relaxed">
              Magzin LLC, 800 Third Avenue Associates, New York, NY, 10022,
              United States
            </p>
            <div className="flex items-center gap-4 shrink-0">
              <p className="shrink-0">
                © {COPYRIGHT_YEAR} {t('brand')}. {t('copyright')}
              </p>
              {mounted ? (
                <LanguageToggle />
              ) : (
                <div className="h-12 w-36 rounded-full bg-blue-600/30 shadow-[0_14px_34px_rgba(37,99,235,0.18)] animate-pulse" />
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
