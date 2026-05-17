'use client';

import { PricingTable } from '@clerk/nextjs';

type ClerkPricingTableProps = {
  className?: string;
};

export function ClerkPricingTable({ className }: ClerkPricingTableProps) {
  return (
    <div
      id="subscribe"
      className={className ?? 'mx-auto w-full max-w-4xl scroll-mt-24'}
    >
      <PricingTable />
    </div>
  );
}
