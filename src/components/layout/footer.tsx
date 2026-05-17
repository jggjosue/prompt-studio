'use client';

import { PromptEditLink } from '@/components/prompt-edit-link';
import Link from 'next/link';
import Logo from './logo';
import { Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');

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

  const links = [
    { href: '/', label: tNav('home') },
    { href: '/prompts', label: tNav('library') },
    { href: '/image-prompts', label: tNav('images') },
    { href: '/video-prompts', label: tNav('videos') },
    { href: '/landing-pages', label: t('landingPages') },
    { href: '/prices', label: tNav('prices') },
    { href: '/prompt/edit', label: t('promptGenerator') },
    { href: '/video-tags', label: tNav('videoTags') },
    { href: '/image-tags', label: tNav('imageTags') },
    { href: '/web-tags', label: t('webTags') },
    { href: '/web-tags?tag=music', label: t('music') },
    { href: '/web-tags?tag=portfolio', label: t('portfolio') },
    { href: '/web-tags?tag=gaming', label: t('gaming') },
    { href: '/web-tags?tag=travel', label: t('travel') },
  ];

  return (
    <footer className="bg-muted/40 text-muted-foreground py-12 md:py-16">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1 space-y-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-foreground font-bold text-lg font-headline"
            >
              <Logo />
              <span>{t('brand')}</span>
            </Link>
            <p className="text-sm">{t('tagline')}</p>
            <p className="text-xs pt-4">
              © {new Date().getFullYear()} {t('brand')}. {t('copyright')}
            </p>
          </div>
          <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h4 className="font-semibold text-foreground mb-4 font-headline">
                {t('links')}
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                {links.map(link => (
                  <li key={link.href}>
                    <PromptEditLink
                      href={link.href}
                      className="text-sm hover:text-foreground transition-colors"
                    >
                      {link.label}
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
