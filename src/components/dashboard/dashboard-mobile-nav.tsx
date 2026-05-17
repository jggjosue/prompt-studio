'use client';

import { PromptEditLink } from '@/components/prompt-edit-link';
import { isPromptEditHref } from '@/lib/prompt-edit';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Clapperboard,
  CreditCard,
  Heart,
  Image,
  LayoutGrid,
  LineChart,
  Settings,
  UserCircle,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

export function DashboardMobileNav() {
  const pathname = usePathname();
  const t = useTranslations('dashboard');

  const links = [
    { href: '/dashboard', label: t('dashboard'), icon: LayoutGrid },
    { href: '/dashboard/analytics', label: t('analytics'), icon: LineChart },
    { href: '/prompt/edit', label: t('create'), icon: Clapperboard },
    { href: '/dashboard/creations', label: t('creations'), icon: Image },
    { href: '/dashboard/favorites', label: t('favorites'), icon: Heart },
    { href: '/dashboard/profile', label: t('profile'), icon: UserCircle },
    { href: '/dashboard/settings', label: t('settings'), icon: Settings },
    { href: '/dashboard/billing', label: t('billing'), icon: CreditCard },
  ];

  return (
    <nav
      className="md:hidden border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      aria-label={t('navLabel')}
    >
      <div className="flex gap-1 overflow-x-auto px-3 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== '/dashboard' && pathname.startsWith(href));
          const className = cn(
            'flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
            active
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          );

          if (isPromptEditHref(href)) {
            return (
              <PromptEditLink key={href} href={href} className={className}>
                <Icon className="h-3.5 w-3.5" />
                {label}
              </PromptEditLink>
            );
          }

          return (
            <Link key={href} href={href} className={className}>
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
