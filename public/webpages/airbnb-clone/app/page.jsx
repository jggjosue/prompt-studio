import { Suspense } from 'react';
import HomeContent from '@/components/HomeContent';

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center text-foggy">
          Cargando…
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
