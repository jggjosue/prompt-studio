'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
  useAuth,
} from '@clerk/nextjs';
import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  CreditCard,
  FolderHeart,
  Globe,
  Handshake,
  HelpCircle,
  ImageIcon,
  LayoutTemplate,
  Layers3,
  // LayoutGrid,
  LogIn,
  Menu,
  PackageCheck,
  Search,
  Scale,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Video,
  WandSparkles,
} from 'lucide-react';
import { ClientLink } from '@/components/client-link';
import { RoutePrefetchProvider } from '@/components/route-prefetch-provider';
import { isNavActive } from '@/lib/app-routes';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
// import { ThemeToggle } from '../theme-toggle';
import { SiteBreadcrumbs } from '@/components/site-breadcrumbs';
import Logo from './logo';

const navLinkClass =
  'text-muted-foreground transition-colors hover:text-foreground rounded-sm px-1 py-0.5';
const navLinkActiveClass = 'text-foreground font-semibold';
const webMenuGroupOrder = ['Explorar', 'Crear', 'Herramientas', 'Mi biblioteca'] as const;
type WebMenuGroup = (typeof webMenuGroupOrder)[number];

/**
 * Los nueve kits de UI en un solo sitio.
 *
 * Antes cada uno ocupaba una entrada suelta en el menú «Webs»: nueve filas
 * seguidas que empujaban el resto fuera de la vista. Ahora son un submenú con
 * rejilla, y los conteos salen de los catálogos reales —`Formularios` tiene 100,
 * no 50, como decía el texto anterior—.
 */
export const UI_KITS: Array<{ href: string; label: string; count: number; unit: 'componentes' | 'animaciones'; description: string }> = [
  { href: '/web-animations', label: 'Animaciones', count: 180, unit: 'animaciones', description: 'Interacciones y microanimaciones web' },
  { href: '/login-components', label: 'Login UI', count: 50, unit: 'componentes', description: 'Autenticación, registro y recuperación' },
  { href: '/header-components', label: 'Headers UI', count: 50, unit: 'componentes', description: 'Encabezados responsive y navegación superior' },
  { href: '/text-components', label: 'Textos UI', count: 50, unit: 'componentes', description: 'Composiciones tipográficas y jerarquías' },
  { href: '/form-components', label: 'Formularios UI', count: 100, unit: 'componentes', description: 'Formularios con validación y estados' },
  { href: '/button-components', label: 'Botones UI', count: 50, unit: 'componentes', description: 'Botones, estados y variantes' },
  { href: '/card-components', label: 'Cards UI', count: 50, unit: 'componentes', description: 'Tarjetas de producto, perfil y contenido' },
  { href: '/navigation-components', label: 'Menús UI', count: 50, unit: 'componentes', description: 'Sistemas de navegación y menús' },
  { href: '/sidebar-components', label: 'Sidebars UI', count: 50, unit: 'componentes', description: 'Barras laterales y paneles' },
];

export const UI_KITS_TOTAL = UI_KITS.reduce((total, kit) => total + kit.count, 0);

type DropdownItem = {
  href: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  group?: WebMenuGroup;
  disabled?: boolean;
  /** Si viene, la entrada abre un submenú con estas opciones en rejilla. */
  kits?: typeof UI_KITS;
};

function groupDropdownItems(items: DropdownItem[]) {
  const grouped = webMenuGroupOrder
    .map(label => ({ label, items: items.filter(item => item.group === label) }))
    .filter(group => group.items.length > 0);
  const ungrouped = items.filter(item => !item.group);

  return ungrouped.length > 0
    ? [...grouped, { label: '', items: ungrouped }]
    : grouped;
}

function pathMatchesPrefix(pathname: string, prefix: string): boolean {
  return isNavActive(pathname, prefix);
}

function isNavItemActive(
  pathname: string,
  href?: string,
  activePrefixes?: string[]
): boolean {
  return isNavActive(pathname, href, activePrefixes);
}

export default function HeaderClient() {
  const [mounted, setMounted] = useState(false);
  const [webMenuPanel, setWebMenuPanel] = useState<'main' | 'kits'>('main');
  useEffect(() => {
    setMounted(true);
  }, []);

  const { isLoaded } = useAuth();
  const pathname = usePathname();
  const tNav = useTranslations('nav');
  const tHeader = useTranslations('header');
  const tCommon = useTranslations('common');

  const navLinks: Array<{
    id: string;
    href?: string;
    label: string;
    activePrefixes?: string[];
    dropdown?: DropdownItem[];
  }> = [
    { id: 'home', href: '/', label: tNav('discover') },
    {
      id: 'webs',
      label: tNav('webs'),
      activePrefixes: ['/landing-pages', '/web-animations', '/login-components', '/header-components', '/text-components', '/form-components', '/button-components', '/card-components', '/navigation-components', '/sidebar-components', '/component-builder', '/page-composer', '/smart-search', '/prompt-optimizer', '/component-kits', '/component-compare', '/my-components', '/code-auditor', '/web-tags', '/generate'],
      dropdown: [
        {
          href: '/prompt-optimizer',
          group: 'Herramientas',
          label: 'Optimizar prompts',
          description: 'Mejora con objetivos y compara los cambios',
          icon: <Sparkles className="h-4 w-4" />,
        },
        {
          href: '/code-auditor',
          group: 'Herramientas',
          label: 'Auditor de código',
          description: 'Detecta errores y genera un prompt de corrección',
          icon: <ShieldCheck className="h-4 w-4" />,
        },
        {
          href: '/my-components',
          group: 'Mi biblioteca',
          label: 'Favoritos y proyectos',
          description: 'Organiza componentes y descarga tus kits',
          icon: <FolderHeart className="h-4 w-4" />,
        },
        {
          href: '/component-compare',
          group: 'Herramientas',
          label: 'Comparar componentes',
          description: 'Compara hasta tres diseños lado a lado',
          icon: <Scale className="h-4 w-4" />,
        },
        {
          href: '/component-kits',
          group: 'Explorar',
          label: 'Kits completos',
          description: 'Colecciones coherentes listas para productos',
          icon: <PackageCheck className="h-4 w-4" />,
        },
        {
          href: '/smart-search',
          group: 'Explorar',
          label: 'Buscador inteligente',
          description: 'Busca por tipo, industria, color y función',
          icon: <Search className="h-4 w-4" />,
        },
        {
          href: '/component-builder',
          group: 'Crear',
          label: 'Constructor visual',
          description: 'Personaliza componentes y genera el prompt',
          icon: <WandSparkles className="h-4 w-4" />,
        },
        {
          href: '/page-composer',
          group: 'Crear',
          label: 'Generador de páginas',
          description: 'Combina componentes y descarga Next.js',
          icon: <LayoutTemplate className="h-4 w-4" />,
        },
        {
          href: '/landing-pages',
          group: 'Explorar',
          label: tNav('templates'),
          description: tNav('templatesDesc'),
          icon: <LayoutTemplate className="h-4 w-4" />,
        },
        {
          href: '/component-kits',
          group: 'Explorar',
          label: 'Componentes UI',
          description: `${UI_KITS.length} kits · ${UI_KITS_TOTAL} piezas con prompts`,
          icon: <Layers3 className="h-4 w-4" />,
          kits: UI_KITS,
        },
        {
          href: '/generate',
          group: 'Crear',
          label: 'Generador Web',
          description: 'Genera nuevas páginas web con IA',
          icon: <Globe className="h-4 w-4" />,
        },
      ],
    },
    {
      id: 'media',
      label: 'Imágenes y Videos',
      activePrefixes: [
        '/image-prompts',
        '/gallery',
        '/image-tags',
        '/video-prompts',
        '/gallery-videos',
        '/video-tags',
        '/generate',
      ],
      dropdown: [
        {
          href: '/image-prompts',
          group: 'Explorar',
          label: tNav('images'),
          description: tNav('imagesDesc'),
          icon: <ImageIcon className="h-4 w-4" />,
        },
        {
          href: '/video-prompts',
          group: 'Explorar',
          label: tNav('videos'),
          description: tNav('videosDesc'),
          icon: <Video className="h-4 w-4" />,
        },
        {
          href: '/generate',
          group: 'Crear',
          label: 'Generar Imagen',
          description: 'Crea imágenes hiperrealistas con IA',
          icon: <ImageIcon className="h-4 w-4" />,
        },
        {
          href: '/generate',
          group: 'Crear',
          label: 'Generar Video',
          description: 'Crea videos cinematográficos con IA',
          icon: <Video className="h-4 w-4" />,
        },
      ],
    },
    {
      id: 'affiliate',
      href: '/affiliate-program',
      label: tNav('affiliateProgram'),
      activePrefixes: ['/affiliate-program', '/affiliate-program-terms'],
    },
    {
      id: 'ask',
      href: '/ask',
      label: tNav('questions'),
      activePrefixes: ['/ask'],
    },
    {
      id: 'pricing',
      href: '/prices',
      label: tNav('prices'),
      activePrefixes: ['/prices', '/pricing'],
    },
  ];

  const linkClassName = (href?: string, activePrefixes?: string[]) =>
    cn(
      navLinkClass,
      isNavItemActive(pathname, href, activePrefixes) && navLinkActiveClass
    );

  return (
    <>
      <RoutePrefetchProvider />
    <header className="sticky top-0 z-50 w-full px-2 sm:px-4 pt-2 sm:pt-4">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between rounded-2xl sm:rounded-3xl border border-white/10 bg-slate-950/70 px-3 sm:px-4 py-3 shadow-[0_20px_70px_rgba(0,0,0,0.32)] backdrop-blur-xl lg:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden mr-2">
              <Menu className="h-6 w-6" />
              <span className="sr-only">{tCommon('toggleMenu')}</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full max-w-sm p-6">
            <ClientLink href="/" className="mr-6 flex items-center gap-2 mb-8">
              <Logo />
              <span className="font-bold sm:inline-block font-headline">
                {tHeader('brand')}
              </span>
            </ClientLink>
            <SheetClose asChild>
              <ClientLink
href="/generate"
                className="mb-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
              >
                <WandSparkles className="h-4 w-4" />
                Crear con IA
              </ClientLink>
            </SheetClose>
            <div className="flex flex-col gap-4">
              {navLinks.map(link =>
                link.href ? (
                  <SheetClose asChild key={link.id}>
                    <ClientLink
                      href={link.href}
                      className={cn(
                        'text-lg font-medium hover:text-foreground/80 transition-colors',
                        isNavItemActive(
                          pathname,
                          link.href,
                          link.activePrefixes
                        ) && 'text-foreground font-semibold'
                      )}
                    >
                      {link.label}
                    </ClientLink>
                  </SheetClose>
                ) : (
                  <Accordion
                    type="single"
                    collapsible
                    className="w-full"
                    key={link.id}
                  >
                    <AccordionItem value={link.label} className="border-b-0">
                      <AccordionTrigger
                        className={cn(
                          'text-lg font-medium hover:no-underline',
                          isNavItemActive(
                            pathname,
                            undefined,
                            link.activePrefixes
                          ) && 'text-foreground font-semibold'
                        )}
                      >
                        {link.label}
                      </AccordionTrigger>
                      <AccordionContent>
                        {link.id === 'webs' && webMenuPanel === 'kits' ? (
                          <div className="space-y-2 py-2 pl-2">
                            <button type="button" onClick={() => setWebMenuPanel('main')} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold hover:bg-blue-600/10">
                              <ArrowLeft className="h-4 w-4" /> Volver a Webs
                            </button>
                            <p className="px-3 text-[10px] font-black uppercase tracking-[0.18em] text-blue-500">Componentes UI</p>
                            <div className="grid grid-cols-2 gap-1.5 px-1">
                              {UI_KITS.map(kit => (
                                <SheetClose asChild key={kit.href}>
                                  <ClientLink href={kit.href} className={cn('rounded-lg border border-border/60 p-2.5 transition-colors hover:border-blue-500/40 hover:bg-blue-600 hover:text-white', pathMatchesPrefix(pathname, kit.href) && 'border-blue-500 bg-blue-600 text-white')} aria-current={pathMatchesPrefix(pathname, kit.href) ? 'page' : undefined}>
                                    <span className="flex items-center justify-between gap-1.5"><span className="truncate text-sm font-semibold">{kit.label}</span><span className="shrink-0 text-[10px] font-black tabular-nums opacity-70">{kit.count}</span></span>
                                  </ClientLink>
                                </SheetClose>
                              ))}
                            </div>
                            <SheetClose asChild><ClientLink href="/component-kits" className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-bold text-blue-500 hover:bg-blue-600/10">Ver todos los kits <ChevronRight className="h-3.5 w-3.5" /></ClientLink></SheetClose>
                          </div>
                        ) : (
                        <div className="space-y-4 py-2 pl-2">
                          {groupDropdownItems(link.dropdown ?? []).map(group => (
                            <section key={group.label || link.id} aria-label={group.label || link.label}>
                              {group.label ? <p className="mb-1 px-3 text-[10px] font-black uppercase tracking-[0.18em] text-blue-500">{group.label}</p> : null}
                              <div className="grid grid-cols-1 gap-1">
                                {group.items.map(item => (
                                  item.disabled ? (
                                    <div
                                      key={item.label}
                                      aria-disabled="true"
                                      className="flex w-full cursor-not-allowed items-start gap-3 rounded-lg p-3 text-left opacity-45"
                                    >
                                      <span className="rounded-md bg-blue-500/10 p-2 text-blue-500">{item.icon}</span>
                                      <span className="min-w-0 flex-1"><span className="block font-semibold">{item.label}</span><span className="block text-xs font-normal text-muted-foreground">{item.description}</span></span>
                                      {item.kits ? <ChevronRight className="mt-1 h-4 w-4" /> : null}
                                    </div>
                                  ) : item.kits ? (
                                    <button key={item.label} type="button" onClick={() => setWebMenuPanel('kits')} className="flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors hover:bg-blue-600/10">
                                      <span className="rounded-md bg-blue-500/10 p-2 text-blue-500">{item.icon}</span>
                                      <span className="min-w-0 flex-1"><span className="block font-semibold">{item.label}</span><span className="block text-xs font-normal text-muted-foreground">{item.description}</span></span>
                                      <ChevronRight className="mt-1 h-4 w-4" />
                                    </button>
                                  ) : (
                                  <SheetClose asChild key={item.label}>
                                    <ClientLink
                                      href={item.href}
                                      className={cn(
                                        'group flex items-start gap-3 rounded-lg p-3 transition-all duration-200 hover:bg-blue-600 hover:text-white',
                                        pathMatchesPrefix(pathname, item.href) &&
                                          'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                      )}
                                    >
                                      <div className="rounded-md bg-blue-500/10 p-2 text-blue-500 transition-colors group-hover:bg-white/15 group-hover:text-white">
                                        {item.icon}
                                      </div>
                                      <div>
                                        <p className="font-semibold">{item.label}</p>
                                        <p className="text-xs text-muted-foreground transition-colors group-hover:text-blue-100">
                                          {item.description}
                                        </p>
                                      </div>
                                    </ClientLink>
                                  </SheetClose>
                                  )
                                ))}
                              </div>
                            </section>
                          ))}
                        </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )
              )}
              {mounted && (
                <>
                  <Show when="signed-out">
                    <div className="mt-6 flex flex-col gap-2 border-t pt-6">
                      <SheetClose asChild>
                        <SignUpButton mode="redirect" forceRedirectUrl="/prices">
                          <span className="flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent">
                            <UserPlus className="h-4 w-4" />
                            {tHeader('createAccount')}
                          </span>
                        </SignUpButton>
                      </SheetClose>
                      <SheetClose asChild>
                        <SignInButton mode="redirect" forceRedirectUrl="/dashboard">
                          <span className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700">
                            <LogIn className="h-4 w-4" />
                            {tHeader('signIn')}
                          </span>
                        </SignInButton>
                      </SheetClose>
                    </div>
                  </Show>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>

        <ClientLink href="/" className="mr-3 flex items-center gap-2 xl:mr-6">
          <Logo />
          <span className="hidden font-bold sm:inline-block font-headline">
            {tHeader('brand')}
          </span>
        </ClientLink>
        <nav className="hidden min-w-0 items-center justify-center gap-3 text-xs font-medium md:flex lg:gap-4 lg:text-sm xl:gap-6 flex-1">
          {navLinks.map(link =>
            link.href ? (
              <ClientLink
                key={link.id}
                href={link.href}
                className={linkClassName(link.href, link.activePrefixes)}
                aria-current={
                  isNavItemActive(pathname, link.href, link.activePrefixes)
                    ? 'page'
                    : undefined
                }
              >
                {link.label}
              </ClientLink>
            ) : (
              <DropdownMenu
                key={link.id}
                onOpenChange={open => {
                  if (!open && link.id === 'webs') setWebMenuPanel('main');
                }}
              >
                <DropdownMenuTrigger
                  className={cn(
                    'flex items-center gap-1 outline-none',
                    linkClassName(undefined, link.activePrefixes)
                  )}
                  aria-current={
                    isNavItemActive(pathname, undefined, link.activePrefixes)
                      ? 'page'
                      : undefined
                  }
                >
                  {link.label}{' '}
                  <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className={cn('max-h-[min(78vh,680px)] overflow-y-auto p-2', (link.id === 'webs' || link.id === 'media') ? 'w-[min(92vw,680px)]' : 'w-72')}>
                  {link.id === 'webs' && webMenuPanel === 'kits' ? (
                    <div className="p-1">
                      <div className="mb-2 flex items-center justify-between border-b border-border/60 px-2 pb-2">
                        <button type="button" onClick={() => setWebMenuPanel('main')} className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-bold hover:bg-blue-600/10">
                          <ArrowLeft className="h-4 w-4" /> Volver
                        </button>
                        <span className="text-xs font-black uppercase tracking-[0.16em] text-blue-500">Componentes UI</span>
                      </div>
                      <div className="grid gap-1 sm:grid-cols-2">
                        {UI_KITS.map(kit => (
                          <DropdownMenuItem key={kit.href} asChild className="p-0 focus:bg-transparent">
                            <ClientLink href={kit.href} className={cn('group flex w-full flex-col gap-0.5 rounded-lg p-2.5 transition-all duration-200 hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white', pathMatchesPrefix(pathname, kit.href) && 'bg-blue-600 text-white')} aria-current={pathMatchesPrefix(pathname, kit.href) ? 'page' : undefined}>
                              <span className="flex items-center justify-between gap-2"><span className="font-semibold">{kit.label}</span><span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-black tabular-nums text-blue-500 transition-colors group-hover:bg-white/20 group-hover:text-white">{kit.count}</span></span>
                              <span className="line-clamp-1 text-xs text-muted-foreground transition-colors group-hover:text-blue-100">{kit.description}</span>
                            </ClientLink>
                          </DropdownMenuItem>
                        ))}
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild className="p-0 focus:bg-transparent">
                        <ClientLink href="/component-kits" className="flex w-full items-center justify-between rounded-lg p-2.5 text-xs font-bold transition-colors hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white">Ver todos los kits <ChevronRight className="h-3.5 w-3.5" /></ClientLink>
                      </DropdownMenuItem>
                    </div>
                  ) : (
                  <div className={cn('grid gap-3', (link.id === 'webs' || link.id === 'media') ? 'sm:grid-cols-2' : 'grid-cols-1')}>
                    {groupDropdownItems(link.dropdown ?? []).map(group => (
                      <section key={group.label || link.id} aria-label={group.label || link.label} className="rounded-xl border border-border/60 bg-background/40 p-1.5">
                        {group.label ? <DropdownMenuLabel className="px-2 pb-1 pt-2 text-[10px] font-black uppercase tracking-[0.18em] text-blue-500">{group.label}</DropdownMenuLabel> : null}
                        <div className="space-y-0.5">
                          {group.items.map(item => (
                            item.disabled ? (
                              <div
                                key={item.label}
                                aria-disabled="true"
                                className="flex w-full cursor-not-allowed items-start gap-3 rounded-lg p-2.5 text-left opacity-45"
                              >
                                <div className="rounded-md bg-blue-500/10 p-1.5 text-blue-500">{item.icon}</div>
                                <div className="min-w-0 flex-1 text-left"><p className="font-semibold">{item.label}</p><p className="line-clamp-2 text-xs text-muted-foreground">{item.description}</p></div>
                                {item.kits ? <ChevronRight className="mt-1 h-4 w-4 shrink-0" /> : null}
                              </div>
                            ) : item.kits ? (
                              <DropdownMenuItem key={item.label} onSelect={(e) => e.preventDefault()} asChild className="p-0 focus:bg-transparent">
                                <button type="button" onClick={(e) => { e.preventDefault(); setWebMenuPanel('kits'); }} className="group flex w-full items-start gap-3 rounded-lg p-2.5 text-left transition-all duration-200 hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white">
                                  <div className="rounded-md bg-blue-500/10 p-1.5 text-blue-500 transition-colors group-hover:bg-white/15 group-hover:text-white group-focus:bg-white/15 group-focus:text-white">{item.icon}</div>
                                  <div className="min-w-0 flex-1 text-left"><p className="font-semibold">{item.label}</p><p className="line-clamp-2 text-xs text-muted-foreground transition-colors group-hover:text-blue-100 group-focus:text-blue-100">{item.description}</p></div>
                                  <ChevronRight className="mt-1 h-4 w-4 shrink-0" />
                                </button>
                              </DropdownMenuItem>
                            ) : (
                            <DropdownMenuItem
                              key={item.label}
                              asChild
                              className="p-0 focus:bg-transparent"
                            >
                              <ClientLink
                                href={item.href}
                                className={cn(
                                  'group flex w-full items-start gap-3 rounded-lg p-2.5 transition-all duration-200 hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white',
                                  pathMatchesPrefix(pathname, item.href) &&
                                    'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                )}
                                aria-current={pathMatchesPrefix(pathname, item.href) ? 'page' : undefined}
                              >
                                <div className="rounded-md bg-blue-500/10 p-1.5 text-blue-500 transition-colors group-hover:bg-white/15 group-hover:text-white group-focus:bg-white/15 group-focus:text-white">
                                  {item.icon}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold">{item.label}</p>
                                  <p className="line-clamp-2 text-xs text-muted-foreground transition-colors group-hover:text-blue-100 group-focus:text-blue-100">
                                    {item.description}
                                  </p>
                                </div>
                              </ClientLink>
                            </DropdownMenuItem>
                            )
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )
          )}
        </nav>

        <div className="flex items-center gap-2 ml-auto shrink-0">
          <ClientLink
            href="/generate"
            className="hidden h-10 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-violet-600 px-3 text-sm font-bold text-white shadow-[0_0_28px_rgba(59,130,246,0.35)] transition hover:scale-[1.02] hover:shadow-[0_0_34px_rgba(59,130,246,0.5)] md:inline-flex xl:px-5"
            aria-current={pathMatchesPrefix(pathname, '/generate') ? 'page' : undefined}
          >
            <WandSparkles className="h-4 w-4" />
            <span className="hidden xl:inline">Crear con IA</span>
            <span className="sr-only xl:hidden">Crear con IA</span>
          </ClientLink>
          {/* Theme selector disabled: the site now always uses dark mode. */}
          {/* <ThemeToggle /> */}
          {(!mounted || !isLoaded) ? (
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          ) : (
            <>
              <Show when="signed-out">
                <div className="hidden md:flex items-center gap-3">
                  <SignInButton mode="redirect" forceRedirectUrl="/dashboard">
                    <button className="rounded-full border border-cyan-200/25 px-5 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-cyan-200/60">
                      {tHeader('signIn')}
                    </button>
                  </SignInButton>
                  <SignUpButton mode="redirect" forceRedirectUrl="/prices">
                    <button className="rounded-full border border-cyan-200/25 px-5 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-cyan-200/60">
                      {tHeader('createAccount')}
                    </button>
                  </SignUpButton>
                </div>
                <div className="flex md:hidden items-center">
                  <SignInButton mode="redirect" forceRedirectUrl="/dashboard">
                    <button className="rounded-full border border-cyan-200/25 px-3.5 py-1.5 text-xs font-semibold text-slate-100 transition hover:border-cyan-200/60">
                      {tHeader('signIn')}
                    </button>
                  </SignInButton>
                </div>
              </Show>
              <Show when="signed-in">
                <div className="flex items-center gap-3">
                  <ClientLink
                    href="/dashboard"
                    className="hidden rounded-full border border-cyan-200/25 px-5 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-cyan-200/60 sm:block"
                  >
                    Dashboard
                  </ClientLink>
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: 'h-9 w-9',
                      },
                    }}
                  />
                </div>
              </Show>
            </>
          )}
        </div>
      </div>
    </header>
    {pathname !== '/' && (
      <SiteBreadcrumbs
        pathname={pathname}
        className="border-b bg-muted/20 hidden md:block"
      />
    )}
    </>
  );
}
