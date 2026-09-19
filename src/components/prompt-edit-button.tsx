'use client';

import { Button, type ButtonProps } from '@/components/ui/button';
import {
  isPromptEditEnabled,
  isPromptEditHref,
  PROMPT_EDIT_PATH,
} from '@/lib/prompt-edit';
import Link from 'next/link';

type PromptEditButtonProps = ButtonProps & {
  href: string;
  target?: string;
  rel?: string;
};

export function PromptEditButton({
  href,
  children,
  asChild: _asChild,
  disabled,
  target,
  rel,
  ...props
}: PromptEditButtonProps) {
  const blocked = !isPromptEditEnabled() && isPromptEditHref(href);

  // Automatically open /generate in a new tab unless caller overrides
  const resolvedTarget = target ?? (href.startsWith(PROMPT_EDIT_PATH) ? '_blank' : undefined);
  const resolvedRel = rel ?? (resolvedTarget === '_blank' ? 'noopener noreferrer' : undefined);

  if (blocked) {
    return (
      <Button disabled={disabled ?? true} {...props}>
        {children}
      </Button>
    );
  }

  return (
    <Button asChild disabled={disabled} {...props}>
      <Link href={href} target={resolvedTarget} rel={resolvedRel}>{children}</Link>
    </Button>
  );
}
