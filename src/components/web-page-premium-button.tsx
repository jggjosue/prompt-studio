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
    <Button size="sm" variant="secondary" asChild>
      <PremiumAccessLink
        membership={membership}
        href={`/web-tags?membership=${encodeURIComponent(membership)}`}
      >
        <Crown className="w-4 h-4 mr-2" />
        {membership}
      </PremiumAccessLink>
    </Button>
  );
}
