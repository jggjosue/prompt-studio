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
  ChevronDown,
  // Globe,
  ImageIcon,
  // LayoutGrid,
  LogIn,
  Menu,
  Tag,
  User,
  UserPlus,
  Video,
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
    dropdown?: Array<{
      href: string;
      label: string;
      description: string;
      icon: React.ReactNode;
    }>;
  }> = [
    { id: 'home', href: '/', label: tNav('home') },
    { id: 'marketplace', href: '/landing-pages', label: tNav('marketplace'), activePrefixes: ['/landing-pages', '/web-tags'] },
    { id: 'videos', href: '/video-prompts', label: tNav('videos'), activePrefixes: ['/video-prompts', '/gallery-videos', '/video-tags'] },
    { id: 'images', href: '/image-prompts', label: tNav('images'), activePrefixes: ['/image-prompts', '/gallery', '/image-tags'] },
    { id: 'membership', href: '/prices', label: tNav('prices'), activePrefixes: ['/prices', '/pricing'] },
    { id: 'affiliate-program', href: '/affiliate-program', label: tNav('affiliateProgram'), activePrefixes: ['/affiliate-program', '/affiliate-program-terms'] },
  ];

  const linkClassName = (href?: string, activePrefixes?: string[]) =>
    cn(
      navLinkClass,
      isNavItemActive(pathname, href, activePrefixes) && navLinkActiveClass
    );

  const accountMenuItems = (
    <>
      <DropdownMenuLabel>{tHeader('accountMenu', { defaultValue: 'My Account' })}</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild className="cursor-pointer">
        <SignUpButton mode="redirect" forceRedirectUrl="/prices">
          <button className="w-full">
            <UserPlus className="mr-2 size-4" />
            <span>{tHeader('createAccount')}</span>
          </button>
        </SignUpButton>
      </DropdownMenuItem>
      <DropdownMenuItem asChild className="cursor-pointer">
        <SignInButton mode="redirect" forceRedirectUrl="/dashboard">
          <button className="w-full">
            <LogIn className="mr-2 size-4" />
            <span>{tHeader('signIn')}</span>
          </button>
        </SignInButton>
      </DropdownMenuItem>
    </>
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
                        <div className="grid grid-cols-1 gap-2 py-2 pl-4">
                          {link.dropdown?.map(item => (
                            <SheetClose asChild key={item.label}>
                              <ClientLink
                                href={item.href}
                                className={cn(
                                  'flex items-start gap-3 p-2 rounded-md hover:bg-accent',
                                  pathMatchesPrefix(pathname, item.href) &&
                                    'bg-accent'
                                )}
                              >
                                <div className="bg-blue-500/10 text-blue-500 p-2 rounded-md">
                                  {item.icon}
                                </div>
                                <div>
                                  <p className="font-semibold">{item.label}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {item.description}
                                  </p>
                                </div>
                              </ClientLink>
                            </SheetClose>
                          ))}
                        </div>
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

        <ClientLink href="/" className="mr-6 flex items-center gap-2">
          <Logo />
          <span className="hidden font-bold sm:inline-block font-headline">
            {tHeader('brand')}
          </span>
        </ClientLink>
        <nav className="hidden items-center justify-center gap-6 text-sm font-medium md:flex flex-1">
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
              <DropdownMenu key={link.id}>
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
                <DropdownMenuContent className="w-64">
                  <div className="grid grid-cols-1 gap-2 p-1">
                    {link.dropdown?.map(item => (
                      <DropdownMenuItem key={item.label} asChild>
                        <ClientLink
                          href={item.href}
                          className={cn(
                            'flex items-start gap-3 p-2 rounded-md hover:bg-accent',
                            pathMatchesPrefix(pathname, item.href) &&
                              'bg-accent'
                          )}
                          aria-current={
                            pathMatchesPrefix(pathname, item.href)
                              ? 'page'
                              : undefined
                          }
                        >
                          <div className="bg-blue-500/10 text-blue-500 p-2 rounded-md">
                            {item.icon}
                          </div>
                          <div>
                            <p className="font-semibold">{item.label}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.description}
                            </p>
                          </div>
                        </ClientLink>
                      </DropdownMenuItem>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          )}
        </nav>

        <div className="flex items-center gap-2 ml-auto shrink-0">
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
                    <button className="rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-violet-500 px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_32px_rgba(59,130,246,0.42)] transition hover:scale-[1.02]">
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
