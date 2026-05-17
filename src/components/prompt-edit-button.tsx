'use client';

import { Button, type ButtonProps } from '@/components/ui/button';
import {
  isPromptEditEnabled,
  isPromptEditHref,
} from '@/lib/prompt-edit';
import Link from 'next/link';

type PromptEditButtonProps = ButtonProps & {
  href: string;
};

export function PromptEditButton({
  href,
  children,
  asChild: _asChild,
  disabled,
  ...props
}: PromptEditButtonProps) {
  const blocked = !isPromptEditEnabled() && isPromptEditHref(href);

  if (blocked) {
    return (
      <Button disabled={disabled ?? true} {...props}>
        {children}
      </Button>
    );
  }

  return (
    <Button asChild disabled={disabled} {...props}>
      <Link href={href}>{children}</Link>
    </Button>
  );
}
