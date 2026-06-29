'use client';

import { PromptEditLink } from '@/components/prompt-edit-link';
import Link from 'next/link';
import { isPromptEditHref } from '@/lib/prompt-edit';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

type SidebarNavLinkProps = {
  href: string;
  className?: string;
  children: React.ReactNode;
  activePrefixes?: string[];
};

export function SidebarNavLink({
  href,
  className,
  children,
  activePrefixes = [],
}: SidebarNavLinkProps) {
  const pathname = usePathname();
  const isActive =
    pathname === href ||
    activePrefixes.some(prefix => pathname.startsWith(prefix));
  const activeClassName = isActive
    ? 'bg-blue-600/15 text-blue-400 ring-1 ring-blue-500/40 shadow-[0_0_0_1px_rgba(37,99,235,0.16)]'
    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground';
  const mergedClassName = cn(
    'flex items-center gap-3 rounded-lg px-3 py-2 transition-all',
    activeClassName,
    className
  );

  if (isPromptEditHref(href)) {
    return (
      <PromptEditLink href={href} className={mergedClassName}>
        {children}
      </PromptEditLink>
    );
  }

  return (
    <Link href={href} className={mergedClassName} aria-current={isActive ? 'page' : undefined}>
      {children}
    </Link>
  );
}
