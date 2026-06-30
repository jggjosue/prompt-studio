import type { ReactNode } from 'react';
import type React from 'react';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { SidebarNavLink } from '@/components/dashboard/sidebar-nav-link';
import { ShoppingCart, UserCircle, UsersRound } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/layout/header';
import { DashboardMobileNav } from '@/components/dashboard/dashboard-mobile-nav';
import { DashboardUpgradeCard } from '@/components/dashboard/dashboard-upgrade-card';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { getTranslations } from 'next-intl/server';
import connectToDatabase from '@/lib/mongoose';
import AffiliateApplication from '@/models/AffiliateApplication';

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const t = await getTranslations('dashboard');
  const { userId } = await auth();
  let isAffiliate = false;
  let isPremiumJoAdmin = false;
  let pendingAffiliateApplications = 0;

  if (userId) {
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      const meta = (user.privateMetadata ?? {}) as { affiliateReferralCode?: string };
      isAffiliate = Boolean(meta.affiliateReferralCode);
      const adminEmail = process.env.PROMPT_STUDIO_PREMIUM_JO?.trim().toLowerCase();
      const userEmail = user.primaryEmailAddress?.emailAddress?.trim().toLowerCase();
      isPremiumJoAdmin = Boolean(adminEmail && userEmail === adminEmail);

      if (userEmail) {
        await connectToDatabase();
        const approvedApplication = await AffiliateApplication.exists({
          email: userEmail,
          status: 'approved',
        });
        isAffiliate = isAffiliate || Boolean(approvedApplication);

        if (isPremiumJoAdmin) {
          pendingAffiliateApplications = await AffiliateApplication.countDocuments({ status: 'pending' });
        }
      }
    } catch (error) {
      console.error('Failed to load dashboard role metadata:', error);
    }
  }
  // const navItems = [
  //   { href: '/dashboard', icon: <LayoutGrid className="h-4 w-4" />, label: t('dashboard') },
  //   { href: '/dashboard/analytics', icon: <LineChart className="h-4 w-4" />, label: t('analytics') },
  //   { href: '/prompt/edit', icon: <Clapperboard className="h-4 w-4" />, label: t('create') },
  //   { href: '/dashboard/creations', icon: <Image className="h-4 w-4" />, label: t('myCreations'), badge: '5' },
  //   { href: '/dashboard/favorites', icon: <Heart className="h-4 w-4" />, label: t('favorites') },
  // ];
  const navItems: { href: string; icon: React.ReactNode; label: string; badge?: string }[] = [];
  
  const settingsNavItems: {
    href: string;
    icon: React.ReactNode;
    label: string;
    description: string;
    badge?: string;
  }[] = [
    {
      href: '/dashboard/profile',
      icon: <UserCircle className="h-4 w-4" />,
      label: t('profile'),
      description: t('profileDesc'),
    },
    ...(isPremiumJoAdmin
      ? [{
          href: '/dashboard/affiliate-applications',
          icon: <UsersRound className="h-4 w-4" />,
          label: t('partners'),
          description: t('partnersDesc'),
          badge: pendingAffiliateApplications > 0 ? String(pendingAffiliateApplications) : undefined,
        }]
      : []),
    ...(isAffiliate
      ? [{
          href: '/dashboard/campaigns',
          icon: <ShoppingCart className="h-4 w-4" />,
          label: t('campaigns'),
          description: t('campaignsDesc'),
        }]
      : []),
    // { href: '/dashboard/settings', icon: <Settings className="h-4 w-4" />, label: t('settings') },
    // { href: '/dashboard/billing', icon: <CreditCard className="h-4 w-4" />, label: t('billing') },
  ];

  return (
    <DashboardShell
      sidebar={
        <div className="flex h-full min-h-0 flex-col gap-2">
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navItems.map(item => (
                <SidebarNavLink
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  {item.icon}
                  {item.label}
                  {item.badge && <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">{item.badge}</Badge>}
                </SidebarNavLink>
              ))}
            </nav>
            <div className="mt-4 px-2 lg:px-4">
              <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t('settingsSection')}
              </h3>
              <nav className="grid gap-2 items-start text-sm font-medium">
                {settingsNavItems.map(item => (
                  <SidebarNavLink
                    key={item.label}
                    href={item.href}
                    className="group rounded-2xl border border-transparent px-4 py-3.5 font-medium transition-all hover:border-blue-500/25 hover:bg-blue-500/5"
                    activePrefixes={item.href === '/dashboard/profile' ? ['/dashboard/profile', '/dashboard/billing'] : [item.href]}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-background/70 text-muted-foreground transition-colors group-hover:border-blue-500/20 group-hover:bg-blue-500/10 group-hover:text-blue-400">
                      {item.icon}
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="text-[0.92rem] font-semibold leading-tight text-foreground">
                        {item.label}
                      </span>
                      <span className="text-xs font-normal text-muted-foreground">
                        {item.description}
                      </span>
                    </span>
                    {item.badge && (
                      <Badge className="ml-auto flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 px-2 text-white">
                        {item.badge}
                      </Badge>
                    )}
                    </SidebarNavLink>
                ))}
              </nav>
            </div>
          </div>
          <div className="mt-auto p-4">
            <DashboardUpgradeCard />
          </div>
        </div>
      }
      compactSidebar={
        <div className="flex flex-col items-center gap-3 py-5">
          <span className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground [writing-mode:vertical-rl]">
            {t('settingsSection')}
          </span>
          <nav className="grid gap-2">
            {settingsNavItems.map(item => (
              <SidebarNavLink
                key={item.label}
                href={item.href}
                className="relative h-11 w-11 justify-center rounded-xl border border-border/60 p-0"
                activePrefixes={item.href === '/dashboard/profile' ? ['/dashboard/profile', '/dashboard/billing'] : [item.href]}
              >
                {item.icon}
                <span className="sr-only">{item.label}</span>
                {item.badge && (
                  <Badge className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[0.65rem] text-white">
                    {item.badge}
                  </Badge>
                )}
              </SidebarNavLink>
            ))}
          </nav>
        </div>
      }
    >
      <div className="flex min-w-0 flex-col">
        <Header />
        <DashboardMobileNav
          isAffiliate={isAffiliate}
          isPremiumJoAdmin={isPremiumJoAdmin}
          pendingAffiliateApplications={pendingAffiliateApplications}
        />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/20 min-w-0">
          {children}
        </main>
      </div>
    </DashboardShell>
  );
}
