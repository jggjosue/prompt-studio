'use client';

import { useEffect, useState } from 'react';
import { ClientLink } from '@/components/client-link';
import { PromptEditLink } from '@/components/prompt-edit-link';
import { getFooterLinkGroups } from '@/lib/internal-link-graph';
import { useTranslations } from 'next-intl';
import { LanguageToggle } from '@/components/language-toggle';
import { Facebook, Instagram } from 'lucide-react';
import type { CSSProperties } from 'react';
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
  const primaryLinks = Array.from(
    new Map(
      primary
        .filter(link => link.path !== '/affiliate-program')
        .map(link => [link.path, link])
    ).values()
  );

  const socialLinks = [
    {
      href: 'https://www.instagram.com/prompstudio/',
      label: 'Instagram',
      icon: Instagram,
      accent: 'from-fuchsia-500/20 via-pink-500/15 to-amber-500/10',
      hover: 'hover:border-fuchsia-400/45 hover:shadow-[0_18px_45px_rgba(236,72,153,0.22)] hover:shadow-fuchsia-500/15',
      hoverRing: 'group-hover:border-fuchsia-300/40 group-hover:bg-fuchsia-500/10',
      glowColor: 'rgba(236, 72, 153, 0.5)',
    },
    {
      href: 'https://www.tiktok.com/@promptstudio',
      label: 'TikTok',
      icon: ({ className }: { className?: string }) => (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
          <path
            fill="currentColor"
            d="M16.6 3c.5 2.9 2.3 4.7 4.7 4.9v3c-1.6.1-3.1-.4-4.6-1.3v6.6c0 4.4-3.1 7.8-7.7 7.8S1.3 20.6 1.3 16.2s3.2-7.8 7.7-7.8c.4 0 .9 0 1.3.1v3.2c-.4-.1-.8-.2-1.3-.2-2.5 0-4.4 1.8-4.4 4.7s1.9 4.6 4.4 4.6c2.7 0 4.5-2 4.5-4.8V1.2h3.1c0 .6 0 1.2.1 1.8Z"
          />
        </svg>
      ),
      accent: 'from-cyan-500/15 via-blue-500/15 to-violet-500/10',
      hover: 'hover:border-cyan-400/45 hover:shadow-[0_18px_45px_rgba(34,211,238,0.20)] hover:shadow-cyan-500/15',
      hoverRing: 'group-hover:border-cyan-300/40 group-hover:bg-cyan-500/10',
      glowColor: 'rgba(34, 211, 238, 0.45)',
    },
    {
      href: 'https://www.pinterest.com/prompstudio/',
      label: 'Pinterest',
      icon: ({ className }: { className?: string }) => (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
          <path
            fill="currentColor"
            d="M12 2.2A9.8 9.8 0 0 0 8.4 21c-.1-.7-.2-1.8 0-2.6l1.6-6.7s-.4-.8-.4-2c0-1.9 1.1-3.3 2.5-3.3 1.2 0 1.8.9 1.8 1.9 0 1.2-.8 3-1.2 4.6-.3 1.3.7 2.4 2 2.4 2.4 0 4.2-2.5 4.2-6.2 0-3.2-2.2-5.5-5.4-5.5-3.7 0-5.9 2.8-5.9 5.8 0 1.2.5 2.5 1.1 3.2.1.1.1.2.1.4l-.4 1.5c-.1.5-.4.6-.8.4-1.6-.7-2.6-2.8-2.6-4.6 0-3.8 2.8-7.2 8.1-7.2 4.2 0 7.5 3 7.5 7 0 4.2-2.6 7.6-6.3 7.6-1.2 0-2.3-.6-2.7-1.3l-.7 2.7c-.2.8-.7 1.8-1.1 2.4A9.8 9.8 0 1 0 12 2.2Z"
          />
        </svg>
      ),
      accent: 'from-rose-500/15 via-red-500/15 to-orange-500/10',
      hover: 'hover:border-rose-400/45 hover:shadow-[0_18px_45px_rgba(244,63,94,0.22)] hover:shadow-rose-500/15',
      hoverRing: 'group-hover:border-rose-300/40 group-hover:bg-rose-500/10',
      glowColor: 'rgba(244, 63, 94, 0.48)',
    },
    {
      href: 'https://www.facebook.com/prompt.stuudio/',
      label: 'Facebook',
      icon: Facebook,
      accent: 'from-blue-500/15 via-sky-500/15 to-cyan-500/10',
      hover: 'hover:border-blue-400/45 hover:shadow-[0_18px_45px_rgba(59,130,246,0.22)] hover:shadow-blue-500/15',
      hoverRing: 'group-hover:border-blue-300/40 group-hover:bg-blue-500/10',
      glowColor: 'rgba(59, 130, 246, 0.48)',
    },
  ];

  const legalLinks = [
    { href: '/terms', label: t('termsOfUse') },
    { href: '/privacy', label: t('privacyPolicy') },
    { href: '/cookies', label: t('cookiePolicy') },
    { href: '/licenses', label: t('licensePolicy') },
    { href: '/refunds', label: t('refundPolicy') },
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
            <div className="flex flex-wrap gap-3 text-muted-foreground">
              {!mounted
                ? socialLinks.map(link => (
                    <span
                      key={link.href}
                      className="inline-flex h-14 w-14 animate-pulse rounded-full border border-white/10 bg-white/5"
                      aria-hidden="true"
                    />
                  ))
                : socialLinks.map((link, index) => {
                const SocialIcon = link.icon;

                return (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`social-premium-glow group relative isolate inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-gradient-to-br ${link.accent} text-white shadow-[0_12px_35px_rgba(0,0,0,0.24)] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:scale-105 hover:border-white/30 ${link.hover}`}
                    style={{
                      '--social-glow': link.glowColor,
                      '--social-glow-delay': `${index * 0.55}s`,
                    } as CSSProperties}
                    aria-label={t('openSocial', { network: link.label })}
                    title={link.label}
                  >
                    <span className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white shadow-inner shadow-white/5 transition-all duration-300 ease-out group-hover:scale-110 group-hover:rotate-[-6deg] ${link.hoverRing}`}>
                      <SocialIcon className="h-5 w-5" />
                    </span>
                    <span className="sr-only">{link.label}</span>
                  </a>
                );
                  })}
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
                        target="_blank"
                        rel="noopener noreferrer"
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
