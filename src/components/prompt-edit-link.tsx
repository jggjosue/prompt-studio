'use client';

import {
  isPromptEditEnabled,
  isPromptEditHref,
} from '@/lib/prompt-edit';
import { cn } from '@/lib/utils';
import { ClientLink } from '@/components/client-link';
import type { LinkProps } from 'next/link';

type PromptEditLinkProps = LinkProps & {
  className?: string;
};

export function PromptEditLink({
  href,
  className,
  children,
  onClick,
  ...props
}: PromptEditLinkProps) {
  const hrefStr = typeof href === 'string' ? href : (href?.pathname ?? '');
  const disabled = !isPromptEditEnabled() && isPromptEditHref(hrefStr);

  if (disabled) {
    return (
      <span
        className={cn(
          'cursor-not-allowed opacity-50 pointer-events-none',
          className
        )}
        aria-disabled="true"
      >
        {children}
      </span>
    );
  }

  return (
    <ClientLink href={href} className={className} onClick={onClick} {...props}>
      {children}
    </ClientLink>
  );
}
