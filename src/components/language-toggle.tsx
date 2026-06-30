'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { setLocaleCookie } from '@/lib/locale';
import { useLocale, useTranslations } from 'next-intl';
import type { Locale } from '@/i18n/config';

const localeOptions: Array<{ value: Locale; labelKey: 'english' | 'spanish' }> = [
  { value: 'en', labelKey: 'english' },
  { value: 'es', labelKey: 'spanish' },
];

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.35"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function LanguageToggle() {
  const locale = useLocale() as Locale;
  const t = useTranslations('language');

  const switchLocale = (nextLocale: Locale) => {
    if (nextLocale === locale) return;
    setLocaleCookie(nextLocale);
    // A full navigation keeps the HTML and RSC payload on the same locale.
    window.location.reload();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="group h-12 rounded-full bg-blue-600 px-5 text-sm font-bold tracking-[0.08em] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_14px_34px_rgba(37,99,235,0.32)] transition-all duration-300 hover:bg-blue-500 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.22),0_18px_44px_rgba(37,99,235,0.42)] focus-visible:ring-blue-300 sm:px-6"
          aria-label={t('toggle')}
        >
          <span className="min-w-16 text-center">
            {locale === 'en' ? t('english') : t('spanish')}
          </span>
          <ChevronDownIcon
            className="h-4 w-4 transition-transform duration-300 group-data-[state=open]:rotate-180"
          />
          <span className="sr-only">{t('toggle')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-44 rounded-2xl border-white/10 bg-slate-950/95 p-2 text-white shadow-2xl shadow-blue-950/30 backdrop-blur-xl"
      >
        {localeOptions.map(option => {
          const isActive = locale === option.value;

          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => switchLocale(option.value)}
              className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold tracking-[0.04em] text-white/85 focus:bg-blue-600 focus:text-white data-[highlighted]:bg-blue-600 data-[highlighted]:text-white"
            >
              <span>{t(option.labelKey)}</span>
              {isActive && <CheckIcon className="h-4 w-4 text-cyan-200" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
