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
import { useState, useEffect } from 'react';
import {
  ChevronDown,
  Globe,
  ImageIcon,
  LayoutGrid,
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
import { LanguageToggle } from '../language-toggle';
import { ThemeToggle } from '../theme-toggle';
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

  const navLinks = [
    { href: '/', label: tNav('home') },
    {
      label: tNav('library'),
      activePrefixes: ['/prompts', '/image-prompts', '/gallery', '/image-tags', '/video-prompts', '/gallery-videos', '/video-tags', '/landing-pages'],
      dropdown: [
        {
          href: '/prompts',
          label: tNav('library'),
          description: tNav('libraryDesc'),
          icon: <LayoutGrid className="h-5 w-5" />,
        },
        {
          href: '/image-prompts',
          label: tNav('images'),
          description: tNav('imageTagsDesc'),
          icon: <ImageIcon className="h-5 w-5" />,
        },
        {
          href: '/video-prompts',
          label: tNav('videos'),
          description: tNav('videoTagsDesc'),
          icon: <Video className="h-5 w-5" />,
        },
        {
          href: '/landing-pages',
          label: tNav('webs'),
          description: tNav('webTagsDesc'),
          icon: <Globe className="h-5 w-5" />,
        },
      ],
    },
    {
      label: tNav('tags'),
      activePrefixes: ['/video-tags', '/image-tags', '/web-tags'],
      dropdown: [
        {
          href: '/video-tags',
          label: tNav('videoTags'),
          description: tNav('videoTagsDesc'),
          icon: <Tag className="h-5 w-5" />,
        },
        {
          href: '/image-tags',
          label: tNav('imageTags'),
          description: tNav('imageTagsDesc'),
          icon: <Tag className="h-5 w-5" />,
        },
        {
          href: '/web-tags',
          label: tNav('webTags'),
          description: tNav('webTagsDesc'),
          icon: <Globe className="h-5 w-5" />,
        },
      ],
    },
    {
      href: '/prompt/edit',
      label: tNav('editor'),
      activePrefixes: ['/prompt/edit'],
    },
    {
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

  const accountMenuItems = (
    <>
      <DropdownMenuItem asChild className="p-0 focus:bg-transparent">
        <SignUpButton mode="redirect" forceRedirectUrl="/prices">
          <span className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent focus:bg-accent">
            <UserPlus className="h-4 w-4 shrink-0" />
            {tHeader('createAccount')}
          </span>
        </SignUpButton>
      </DropdownMenuItem>
      <DropdownMenuItem asChild className="p-0 focus:bg-transparent">
        <SignInButton mode="redirect" forceRedirectUrl="/dashboard">
          <span className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-[#B08D57] hover:text-foreground focus:bg-[#B08D57] focus:text-foreground">
            <LogIn className="h-4 w-4 shrink-0" />
            {tHeader('signIn')}
          </span>
        </SignInButton>
      </DropdownMenuItem>
    </>
  );

  return (
    <>
      <RoutePrefetchProvider />
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center gap-2 min-w-0">
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
                  <SheetClose asChild key={link.label}>
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
                    key={link.label}
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
                                <div className="bg-primary/10 text-primary p-2 rounded-md">
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
                  <Show when="signed-in">
                    <SheetClose asChild>
                      <ClientLink
                        href="/dashboard/profile"
                        className={cn(
                          'text-lg font-medium hover:text-foreground/80 transition-colors',
                          isNavItemActive(pathname, '/dashboard/profile', ['/dashboard']) && 'text-foreground font-semibold'
                        )}
                      >
                        {tHeader('profile')}
                      </ClientLink>
                    </SheetClose>
                  </Show>
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
                          <span className="flex w-full items-center justify-center gap-2 rounded-md bg-[#B08D57] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[#9a7a4b]">
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
                key={link.label}
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
              <DropdownMenu key={link.label}>
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
                          <div className="bg-primary/10 text-primary p-2 rounded-md">
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
          {mounted && (
            <Show when="signed-in">
              <ClientLink
                href="/dashboard/profile"
                className={linkClassName('/dashboard/profile', ['/dashboard'])}
                aria-current={isNavItemActive(pathname, '/dashboard/profile', ['/dashboard']) ? 'page' : undefined}
              >
                {tHeader('profile')}
              </ClientLink>
            </Show>
          )}
        </nav>

        <div className="flex items-center gap-2 ml-auto shrink-0">
          <LanguageToggle />
          <ThemeToggle />
          {(!mounted || !isLoaded) ? (
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          ) : (
            <>
              <Show when="signed-out">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full"
                      aria-label={tHeader('accountMenu')}
                    >
                      <User className="h-5 w-5" strokeWidth={1.75} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 p-1.5">
                    {accountMenuItems}
                  </DropdownMenuContent>
                </DropdownMenu>
              </Show>
              <Show when="signed-in">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: 'h-9 w-9',
                    },
                  }}
                />
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
