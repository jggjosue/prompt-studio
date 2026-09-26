'use client';

import dynamic from 'next/dynamic';

const ComponentCompareClient = dynamic(() => import('./component-compare-client'), {
  loading: () => (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="h-16 w-full border-b border-border/40 bg-background/60" />
      <main className="flex-1 pb-20">
        <div className="border-b border-border/40 bg-muted/20 py-12 px-4 sm:px-6">
          <div className="mx-auto max-w-7xl animate-pulse space-y-4">
            <div className="h-6 w-44 rounded-full bg-muted" />
            <div className="h-12 max-w-xl rounded-2xl bg-muted" />
            <div className="h-5 max-w-2xl rounded-lg bg-muted/70" />
            <div className="flex gap-2 pt-4">
              <div className="h-7 w-36 rounded-lg bg-muted" />
              <div className="h-7 w-44 rounded-lg bg-muted" />
              <div className="h-7 w-32 rounded-lg bg-muted" />
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-[330px_1fr]">
            <div className="space-y-4">
              <div className="h-56 rounded-2xl border border-border/60 bg-muted/20 animate-pulse" />
              <div className="h-80 rounded-2xl border border-border/60 bg-muted/20 animate-pulse" />
            </div>
            <div className="h-[500px] rounded-2xl border border-border/60 bg-muted/20 animate-pulse" />
          </div>
        </div>
      </main>
    </div>
  ),
});

export default function DeferredComponentCompare() {
  return <ComponentCompareClient />;
}
