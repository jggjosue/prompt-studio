'use client';

import dynamic from 'next/dynamic';

const ComponentCompareClient = dynamic(() => import('./component-compare-client'), {
  loading: () => (
    <main className="grid min-h-[70vh] place-items-center bg-background px-4">
      <div className="w-full max-w-5xl animate-pulse space-y-5" aria-label="Cargando comparador">
        <div className="h-8 w-48 rounded-lg bg-muted" />
        <div className="h-14 max-w-2xl rounded-xl bg-muted" />
        <div className="grid gap-4 md:grid-cols-3">
          <div className="h-80 rounded-2xl bg-muted" />
          <div className="h-80 rounded-2xl bg-muted" />
          <div className="h-80 rounded-2xl bg-muted" />
        </div>
      </div>
    </main>
  ),
});

export default function DeferredComponentCompare() {
  return <ComponentCompareClient />;
}
