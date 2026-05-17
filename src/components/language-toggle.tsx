'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { setLocaleCookie } from '@/lib/locale';
import { Languages } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import type { Locale } from '@/i18n/config';

export function LanguageToggle() {
  const locale = useLocale() as Locale;
  const t = useTranslations('language');
  const router = useRouter();

  const switchLocale = (nextLocale: Locale) => {
    if (nextLocale === locale) return;
    setLocaleCookie(nextLocale);
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{t('toggle')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => switchLocale('en')}
          className={locale === 'en' ? 'bg-accent' : undefined}
        >
          {t('english')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => switchLocale('es')}
          className={locale === 'es' ? 'bg-accent' : undefined}
        >
          {t('spanish')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
