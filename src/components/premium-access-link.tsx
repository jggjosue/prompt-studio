'use client';

import { useMembershipAccess } from '@/hooks/use-membership-access';
import Link from 'next/link';
import type { ComponentProps } from 'react';

type PremiumAccessLinkProps = Omit<ComponentProps<typeof Link>, 'onClick'> & {
  membership?: string;
  onClick?: ComponentProps<typeof Link>['onClick'];
};

export function PremiumAccessLink({
  membership,
  onClick,
  href,
  target,
  ...props
}: PremiumAccessLinkProps) {
  const { requestAccess } = useMembershipAccess();

  return (
    <Link
      href={href}
      target={target}
      {...props}
      onClick={e => {
        onClick?.(e);
        if (e.defaultPrevented) return;

        const allowed = requestAccess(membership);
        if (allowed !== true) {
          e.preventDefault();
          return;
        }

        if (target === '_blank') {
          e.preventDefault();
          window.open(typeof href === 'string' ? href : href.pathname, '_blank', 'noopener,noreferrer');
        }
      }}
    />
  );
}
