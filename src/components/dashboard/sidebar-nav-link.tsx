'use client';

import { PromptEditLink } from '@/components/prompt-edit-link';
import Link from 'next/link';
import { isPromptEditHref } from '@/lib/prompt-edit';

type SidebarNavLinkProps = {
  href: string;
  className?: string;
  children: React.ReactNode;
};

export function SidebarNavLink({
  href,
  className,
  children,
}: SidebarNavLinkProps) {
  if (isPromptEditHref(href)) {
    return (
      <PromptEditLink href={href} className={className}>
        {children}
      </PromptEditLink>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
