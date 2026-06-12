'use client';

import { Button } from '@/components/ui/button';
import { PremiumAccessLink } from '@/components/premium-access-link';
import { Crown } from 'lucide-react';

type PremiumMembershipButtonProps = {
  membership?: string;
};

export function PremiumMembershipButton({ membership }: PremiumMembershipButtonProps) {
  if (!membership) return null;

  return (
    <Button
      size="sm"
      variant="secondary"
      className="border border-blue-500/25 text-blue-300 hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-200"
      asChild
    >
      <PremiumAccessLink
        membership={membership}
        href={`/web-tags?membership=${encodeURIComponent(membership)}`}
        className="!border-blue-500/25 !text-blue-300 hover:!border-blue-500/40 hover:!bg-blue-500/10 hover:!text-blue-200"
      >
        <Crown className="w-4 h-4 mr-2" />
        {membership}
      </PremiumAccessLink>
    </Button>
  );
}
