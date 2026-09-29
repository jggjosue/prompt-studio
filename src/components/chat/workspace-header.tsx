'use client';

import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { useAuth } from '@clerk/nextjs';
import Logo from '@/components/layout/logo';
import { Zap, ChevronDown, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChatGeneratorReturn } from '@/lib/chat-types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SignInButton } from '@clerk/nextjs';
import { useTranslations } from 'next-intl';

const QUICK_NAV = [
  { href: '/', labelKey: 'discover' },
  { href: '/image-prompts', labelKey: 'images' },
  { href: '/video-prompts', labelKey: 'videos' },
  { href: '/landing-pages', labelKey: 'webs' },
  { href: '/prices', labelKey: 'prices' },
] as const;

interface WorkspaceHeaderProps {
  chat: ChatGeneratorReturn;
}

export function WorkspaceHeader({ chat }: WorkspaceHeaderProps) {
  const t = useTranslations('workspaceHeader');
  const tNav = useTranslations('nav');
  const tHeader = useTranslations('header');
  const { isSignedIn, isLoaded } = useAuth();
  const credits = chat.imageGen.credits;
  const creditsDisplay = Number.isInteger(credits) ? credits.toString() : credits.toFixed(1);
  const lowCredits = credits < 10;

  return (
    <header
      className="flex h-12 shrink-0 items-center gap-4 border-b border-border/60 bg-background/80 px-3 backdrop-blur-sm"
      role="banner"
    >
      {/* Logo + product name */}
      <Link
        href="/"
        className="flex items-center gap-2 rounded-md px-1 py-0.5 text-foreground transition-colors hover:text-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={t('homeLabel')}
      >
        <Logo />
        <span className="hidden text-sm font-bold sm:inline">Prompt Studio</span>
      </Link>

      {/* Workspace label */}
      <div className="hidden h-5 w-px bg-border/60 sm:block" aria-hidden="true" />
      <span className="hidden text-xs font-semibold text-muted-foreground sm:inline" aria-label={tNav('createWithAI')}>
        {tNav('createWithAI')}
      </span>

      {/* Quick nav (unobtrusive) */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="hidden items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex"
            aria-label={t('exploreSections')}
          >
            {t('explore')}
            <ChevronDown className="h-3 w-3" aria-hidden="true" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-44">
          <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground">
            {tNav('discover')}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {QUICK_NAV.map(item => (
            <DropdownMenuItem key={item.href} asChild>
              <Link
                href={item.href}
                className="flex items-center justify-between"
              >
                {tNav(item.labelKey)}
                <ExternalLink className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Spacer */}
      <div className="flex-1" aria-hidden="true" />

      {/* Credit display */}
      {isLoaded && isSignedIn && (
        <Link
          href="/prices"
          className={cn(
            'flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            lowCredits
              ? 'border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
              : 'border-border/60 bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
          aria-label={lowCredits
            ? t('lowCreditsLabel', { credits: creditsDisplay })
            : t('creditsLabel', { credits: creditsDisplay })}
        >
          <Zap className={cn('h-3 w-3', lowCredits ? 'text-amber-400' : 'text-blue-400')} aria-hidden="true" />
          <span>{creditsDisplay}</span>
          <span className="hidden sm:inline text-muted-foreground font-normal">{t('credits')}</span>
        </Link>
      )}

      {/* Auth */}
      {!isLoaded ? (
        <div className="h-7 w-7 rounded-full bg-muted animate-pulse" aria-hidden="true" />
      ) : isSignedIn ? (
        <UserButton
          appearance={{
            elements: { avatarBox: 'h-7 w-7' },
          }}
        />
      ) : (
        <SignInButton mode="redirect" forceRedirectUrl="/generate">
          <button
            type="button"
            className="rounded-full border border-border/60 px-3 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:border-border hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {tHeader('signIn')}
          </button>
        </SignInButton>
      )}
    </header>
  );
}
