'use client';

import { PromptEditLink } from '@/components/prompt-edit-link';
import { ClientLink } from '@/components/client-link';
import { getFooterLinkGroups } from '@/lib/internal-link-graph';
import Logo from './logo';
import { Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');
  const tRoot = useTranslations();
  const tLinks = useTranslations('internalLinks');
  const { primary, discovery, topical } = getFooterLinkGroups();

  const legalLinks = [
    {
      href: 'https://clerk.com/legal/terms',
      label: t('termsOfUse'),
    },
    {
      href: 'https://clerk.com/legal/privacy',
      label: t('privacyPolicy'),
    },
  ];

  return (
    <footer className="bg-muted/40 text-muted-foreground py-12 md:py-16">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1 space-y-4">
            <ClientLink
              href="/"
              className="flex items-center gap-2 text-foreground font-bold text-lg font-headline"
            >
              <Logo />
              <span>{t('brand')}</span>
            </ClientLink>
            <p className="text-sm">{t('tagline')}</p>
            <div className="pt-4 space-y-1.5">
              <p className="text-[11px] text-muted-foreground/80 leading-relaxed font-sans">
                Magzin LLC, 800 Third Avenue Associates, New York, NY, 10022, United States
              </p>
              <p className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} {t('brand')}. {t('copyright')}
              </p>
            </div>
          </div>
          <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-5 gap-8">
            <div>
              <h4 className="font-semibold text-foreground mb-4 font-headline">
                {tLinks('footerPrimary')}
              </h4>
              <ul className="space-y-3">
                <li>
                  <ClientLink
                    href="/"
                    className="text-sm hover:text-foreground transition-colors"
                  >
                    {tNav('home')}
                  </ClientLink>
                </li>
                {primary.map(link => (
                  <li key={link.path}>
                    <PromptEditLink
                      href={link.path}
                      className="text-sm hover:text-foreground transition-colors"
                    >
                      {tRoot(link.labelKey)}
                    </PromptEditLink>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4 font-headline">
                {tLinks('footerDiscovery')}
              </h4>
              <ul className="space-y-3">
                {discovery.map(link => (
                  <li key={link.path}>
                    <PromptEditLink
                      href={link.path}
                      className="text-sm hover:text-foreground transition-colors"
                    >
                      {tRoot(link.labelKey)}
                    </PromptEditLink>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4 font-headline">
                {tLinks('footerTopics')}
              </h4>
              <ul className="space-y-3">
                {topical.map(link => (
                  <li key={link.path}>
                    <PromptEditLink
                      href={link.path}
                      className="text-sm hover:text-foreground transition-colors"
                    >
                      {tRoot(link.labelKey)}
                    </PromptEditLink>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4 font-headline">
                {t('contact')}
              </h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="mailto:hi@prompstudio.com"
                    className="flex items-center gap-2 text-sm hover:text-foreground transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    hi@prompstudio.com
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4 font-headline">
                {t('legal')}
              </h4>
              <ul className="space-y-3">
                {legalLinks.map(link => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
