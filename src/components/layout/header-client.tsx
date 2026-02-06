'use client';

import Link from 'next/link';
import {
  ChevronDown,
  Menu,
  Video,
  ImageIcon,
  Tag,
  LayoutGrid,
  DollarSign,
  Settings,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import Logo from './logo';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ThemeToggle } from '../theme-toggle';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
import {
  LoginLink,
  RegisterLink,
  LogoutLink,
} from '@kinde-oss/kinde-auth-nextjs/components';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

export default function HeaderClient() {
  const { user, isAuthenticated, isLoading } = useKindeBrowserClient();

  const navLinks = [
    { href: '/', label: 'Home' },
    {
      label: 'Video',
      dropdown: [
        {
          href: '/video-prompts',
          label: 'Video Prompts',
          description: 'Browse AI video prompts',
          icon: <Video className="h-5 w-5" />,
        },
      ],
    },
    {
      label: 'Image',
      dropdown: [
        {
          href: '/image-prompts',
          label: 'Image Prompts',
          description: 'Browse AI image prompts',
          icon: <ImageIcon className="h-5 w-5" />,
        },
      ],
    },
    {
      label: 'Tag',
      dropdown: [
        {
          href: '#',
          label: 'Video Tags',
          description: 'Browse AI video tags',
          icon: <Tag className="h-5 w-5" />,
        },
        {
          href: '#',
          label: 'Image Tags',
          description: 'Browse AI image tags',
          icon: <Tag className="h-5 w-5" />,
        },
      ],
    },
    { href: '/pricing', label: 'Pricing' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden mr-2">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full max-w-sm p-6">
            <Link href="/" className="mr-6 flex items-center gap-2 mb-8">
              <Logo />
              <span className="font-bold sm:inline-block font-headline">
                Prompt Studio
              </span>
            </Link>
            <div className="flex flex-col gap-4">
              {navLinks.map(link =>
                link.href ? (
                  <SheetClose asChild key={link.label}>
                    <Link
                      href={link.href}
                      className="text-lg font-medium hover:text-foreground/80 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                ) : (
                  <Accordion
                    type="single"
                    collapsible
                    className="w-full"
                    key={link.label}
                  >
                    <AccordionItem value={link.label} className="border-b-0">
                      <AccordionTrigger className="text-lg font-medium hover:no-underline">
                        {link.label}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-1 gap-2 py-2 pl-4">
                          {link.dropdown?.map(item => (
                            <SheetClose asChild key={item.label}>
                              <Link
                                href={item.href}
                                className="flex items-start gap-3 p-2 rounded-md hover:bg-accent"
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
                              </Link>
                            </SheetClose>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )
              )}
            </div>
          </SheetContent>
        </Sheet>

        <Link href="/" className="mr-6 flex items-center gap-2">
          <Logo />
          <span className="hidden font-bold sm:inline-block font-headline">
            Prompt Studio
          </span>
        </Link>
        <nav className="hidden items-center justify-start gap-6 text-sm font-medium md:flex flex-1">
          {navLinks.map(link =>
            link.href ? (
              <Link
                key={link.label}
                href={link.href}
                className="hover:text-foreground/80 transition-colors"
              >
                {link.label}
              </Link>
            ) : (
              <DropdownMenu key={link.label}>
                <DropdownMenuTrigger className="flex items-center gap-1 hover:text-foreground/80 transition-colors outline-none">
                  {link.label}{' '}
                  <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64">
                  <div className="grid grid-cols-1 gap-2 p-1">
                    {link.dropdown?.map(item => (
                      <DropdownMenuItem key={item.label} asChild>
                        <Link
                          href={item.href}
                          className="flex items-start gap-3 p-2 rounded-md hover:bg-accent"
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
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          )}
        </nav>

        <div className="flex items-center gap-2 ml-auto">
          <ThemeToggle />
          {isLoading && (
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          )}
          {!isLoading && !isAuthenticated && (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <LoginLink>Sign in</LoginLink>
              </Button>
              <Button asChild>
                <RegisterLink>Sign up</RegisterLink>
              </Button>
            </div>
          )}
          {!isLoading && isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user?.picture ?? undefined}
                      alt={user?.given_name ?? 'user'}
                    />
                    <AvatarFallback>
                      {user?.given_name?.[0]}
                      {user?.family_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem>
                  <Link href="/dashboard" className="flex items-center w-full">
                    <LayoutGrid className="mr-2" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/dashboard/billing" className="flex items-center w-full">
                    <DollarSign className="mr-2" />
                    Billing
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/dashboard/settings" className="flex items-center w-full">
                    <Settings className="mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <LogoutLink className="flex items-center w-full">
                    <LogOut className="mr-2" />
                    Sign out
                  </LogoutLink>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
