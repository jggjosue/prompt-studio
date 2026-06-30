'use client';

import { PromptEditLink } from '@/components/prompt-edit-link';
import { isPromptEditHref } from '@/lib/prompt-edit';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  // Clapperboard,
  CreditCard,
  // Heart,
  // Image,
  // LayoutGrid,
  // LineChart,
  UserCircle,
  UsersRound,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';

type DashboardMobileNavProps = {
  isAffiliate: boolean;
  isPremiumJoAdmin: boolean;
  pendingAffiliateApplications: number;
};

export function DashboardMobileNav({
  isAffiliate,
  isPremiumJoAdmin,
  pendingAffiliateApplications,
}: DashboardMobileNavProps) {
  const pathname = usePathname();
  const t = useTranslations('dashboard');

  const links = [
    // { href: '/dashboard', label: t('dashboard'), icon: LayoutGrid },
    // { href: '/dashboard/analytics', label: t('analytics'), icon: LineChart },
    // { href: '/prompt/edit', label: t('create'), icon: Clapperboard },
    // { href: '/dashboard/creations', label: t('creations'), icon: Image },
    // { href: '/dashboard/favorites', label: t('favorites'), icon: Heart },
    { href: '/dashboard/profile', label: t('profile'), icon: UserCircle },
    ...(isPremiumJoAdmin
      ? [{
          href: '/dashboard/affiliate-applications',
          label: t('partners'),
          icon: UsersRound,
          badge: pendingAffiliateApplications,
        }]
      : []),
    // { href: '/dashboard/settings', label: t('settings'), icon: Settings },
    // { href: '/dashboard/billing', label: t('billing'), icon: CreditCard },
    ...(isAffiliate
      ? [{ href: '/dashboard/campaigns', label: t('campaigns'), icon: CreditCard }]
      : []),
  ];

  return (
    <nav
      className="md:hidden border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      aria-label={t('navLabel')}
    >
      <div className="flex gap-2 overflow-x-auto px-3 py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {links.map(({ href, label, icon: Icon, badge }) => {
          const active =
            pathname === href ||
            (href !== '/dashboard' && pathname.startsWith(href));
          const className = cn(
            'flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all',
            active
              ? 'border-blue-500/30 bg-blue-600/15 text-blue-400 shadow-[0_0_0_1px_rgba(37,99,235,0.12)]'
              : 'border-border/60 bg-background/70 text-muted-foreground hover:border-blue-500/20 hover:bg-blue-500/5 hover:text-foreground'
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
              <Icon className="h-4 w-4" />
              {label}
              {badge ? (
                <Badge className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[0.65rem] text-white">
                  {badge}
                </Badge>
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
