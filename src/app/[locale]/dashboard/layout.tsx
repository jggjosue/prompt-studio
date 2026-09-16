import type { ReactNode } from 'react';
import type React from 'react';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { SidebarNavLink } from '@/components/dashboard/sidebar-nav-link';
import { Activity, BarChart3, Braces, Clock3, Coins, CreditCard, Fingerprint, Flag, FlaskConical, FolderKanban, Gauge, Layers3, Library, Megaphone, Palette, Rocket, ShoppingCart, Store, UserCircle, UsersRound } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/layout/header';
import { DashboardMobileNav } from '@/components/dashboard/dashboard-mobile-nav';
import { DashboardUpgradeCard } from '@/components/dashboard/dashboard-upgrade-card';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { getTranslations } from 'next-intl/server';
import connectToDatabase from '@/lib/mongoose';
import AffiliateApplication from '@/models/AffiliateApplication';

/**
 * Contenido por usuario: nunca debe prerenderizarse ni cachearse en el edge.
 * Marcarlo explícitamente evita que el prerender lo intente y falle en build.
 */
export const dynamic = 'force-dynamic';

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
  //   { href: '/generate-images', icon: <Clapperboard className="h-4 w-4" />, label: t('create') },
  //   { href: '/dashboard/creations', icon: <Image className="h-4 w-4" />, label: t('myCreations'), badge: '5' },
  //   { href: '/dashboard/favorites', icon: <Heart className="h-4 w-4" />, label: t('favorites') },
  // ];
  const navItems: { href: string; icon: React.ReactNode; label: string; badge?: string }[] = [];
  
  const allSettingsNavItems: {
    href: string;
    icon: React.ReactNode;
    label: string;
    description: string;
    badge?: string;
  }[] = [
    {
      href: '/dashboard/assets',
      icon: <Fingerprint className="h-4 w-4" />,
      label: 'Procedencia de activos',
      description: 'Origen, licencia y usos',
    },
    {
      href: '/dashboard/output-contracts',
      icon: <Braces className="h-4 w-4" />,
      label: 'Contratos de salida',
      description: 'Esquemas, reglas y reparación',
    },
    {
      href: '/dashboard/model-regressions',
      icon: <Gauge className="h-4 w-4" />,
      label: 'Regresión de modelos',
      description: 'Baseline, cambios y degradación',
    },
    {
      href: '/dashboard/evaluations',
      icon: <FlaskConical className="h-4 w-4" />,
      label: 'Evaluaciones IA',
      description: 'Datasets, rúbricas e historial',
    },
    {
      href: '/dashboard/human-evaluations',
      icon: <FlaskConical className="h-4 w-4" />,
      label: 'Evaluación humana',
      description: 'Comparaciones ciegas y preferencias',
    },
    {
      href: '/dashboard/creator-marketplace',
      icon: <Store className="h-4 w-4" />,
      label: 'Panel del creador',
      description: 'Productos, revisión y ventas',
    },
    {
      href: '/dashboard/campaign-assistant',
      icon: <Megaphone className="h-4 w-4" />,
      label: 'Centro de campañas',
      description: 'Progreso, costos y próximo paso',
    },
    {
      href: '/dashboard/publications',
      icon: <Rocket className="h-4 w-4" />,
      label: 'Publicaciones',
      description: 'Dominios, GitHub y Vercel',
    },
    {
      href: '/dashboard/batches',
      icon: <Layers3 className="h-4 w-4" />,
      label: 'Generación por lotes',
      description: 'CSV, formatos e idiomas',
    },
    {
      href: '/dashboard/brand-kits',
      icon: <Palette className="h-4 w-4" />,
      label: 'Brand Kits',
      description: 'Identidad para todos los generadores',
    },
    {
      href: '/dashboard/projects',
      icon: <FolderKanban className="h-4 w-4" />,
      label: 'Proyectos',
      description: 'Contexto, recursos y decisiones',
    },
    {
      href: '/dashboard/prompt-lab',
      icon: <FlaskConical className="h-4 w-4" />,
      label: 'Laboratorio A/B',
      description: 'Compara prompts y modelos',
    },
    {
      href: '/dashboard/generations',
      icon: <Clock3 className="h-4 w-4" />,
      label: 'Generaciones',
      description: 'Progreso y resultados',
    },
    {
      href: '/dashboard/library',
      icon: <Library className="h-4 w-4" />,
      label: 'Mis compras',
      description: 'Recibos y descargas',
    },
    {
      href: '/dashboard/profile',
      icon: <UserCircle className="h-4 w-4" />,
      label: t('profile'),
      description: t('profileDesc'),
    },
    ...(isPremiumJoAdmin
      ? [{
          href: '/dashboard/feature-experiments',
          icon: <Flag className="h-4 w-4" />,
          label: 'Experimentos',
          description: 'Flags, conversión, retención y margen',
        }, {
          href: '/dashboard/main-funnel',
          icon: <BarChart3 className="h-4 w-4" />,
          label: 'Embudo principal',
          description: 'Conversión, tiempo, costo y abandono',
        }, {
          href: '/dashboard/observability',
          icon: <Activity className="h-4 w-4" />,
          label: 'Observabilidad',
          description: 'Rendimiento y conversión',
        }, {
          href: '/dashboard/provider-quality',
          icon: <Activity className="h-4 w-4" />,
          label: 'Calidad de proveedores',
          description: 'Éxito, latencia, costo y errores',
        }, {
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
    { href: '/dashboard/credits', icon: <Coins className="h-4 w-4" />, label: t('credits'), description: t('creditsDesc') },
    { href: '/dashboard/billing', icon: <CreditCard className="h-4 w-4" />, label: t('billing'), description: t('billingDesc') },
  ];
  const settingsNavItems = isPremiumJoAdmin ? allSettingsNavItems : [];

  return (
    <DashboardShell
      sidebar={
        <div className="flex h-full min-h-0 flex-col gap-2">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
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
            <div className="mt-4 px-2 pb-4 lg:px-4">
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
