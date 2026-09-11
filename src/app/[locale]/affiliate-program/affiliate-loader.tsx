'use client';

import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

const AffiliateClient = dynamic(() => import('./affiliate-client'), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  ),
});

export default function AffiliateLoader({ locale }: { locale: string }) {
  return <AffiliateClient key={locale} />;
}

