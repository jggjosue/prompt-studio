'use client';

import { AlertCircle, Loader2, Sparkles } from 'lucide-react';
import type { GenerationError } from '@/hooks/use-generation-editor';

export function GenerationProgress({
  active,
  progress,
  status,
  pending = false,
}: {
  active: boolean;
  progress: number;
  status: string;
  pending?: boolean;
}) {
  if (!active && !pending) return null;

  return (
    <div className="absolute inset-0 bg-background/95 flex flex-col items-center justify-center p-6 z-10 text-center space-y-4">
      <div className="relative flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
        <Sparkles className="h-5 w-5 text-blue-400 absolute animate-pulse" />
      </div>
      <div className="space-y-1.5 max-w-[280px]">
        <p className="font-bold text-sm text-foreground">
          {active ? 'Running generation' : 'Preparing generation'}
        </p>
        <p className="text-xs text-muted-foreground animate-pulse">
          {active ? status : 'Preparing the request…'}
        </p>
      </div>
      <div className="w-full max-w-[200px] h-1.5 bg-muted rounded-full overflow-hidden border">
        <div
          className="bg-blue-600 h-full transition-all duration-300 rounded-full"
          style={{ width: `${active ? progress : 5}%` }}
        />
      </div>
    </div>
  );
}

export function GenerationErrorNotice({ error }: { error: GenerationError }) {
  if (!error) return null;
  return (
    <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm">
      <div className="flex items-start gap-2">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
        <div>
          <p className="font-semibold">{error.title}</p>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      </div>
    </div>
  );
}
