import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import WebAnimationsClient from './web-animations-client';

export const metadata: Metadata = {
  title: 'Web Animations | Prompt Studio',
  description:
    'Galería de animaciones web reutilizables con HTML, CSS y JavaScript.',
  alternates: { canonical: '/web-animations' },
};

export default function WebAnimationsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <WebAnimationsClient />
    </Suspense>
  );
}
